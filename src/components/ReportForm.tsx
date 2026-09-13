import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, HelperText, useTheme } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { DownloadDialog } from "./DownloadDialog";
import { reportService, ReportFormValues } from "../services/ReportService";
import { checkIsJsonService } from "../services/CheckIsJsonService";
import { storageService } from "../services/StorageService";
import { fileService } from "../services/FileService";

interface ReportFormProps {
  loading: (state: boolean) => void;
  scanValue: string;
  cancel: boolean;
  qrScanValue: (val: string) => void;
  onNotification?: (
    type: "success" | "error",
    title: string,
    message: string,
  ) => void;
}

export interface ReportFormHandle {
  openReport: () => void;
}

const ReportForm = forwardRef<ReportFormHandle, ReportFormProps>(
  ({ loading, scanValue, cancel, onNotification }, ref) => {
    const theme = useTheme();
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(
      null,
    );
    const [dialogVisible, setDialogVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [localFilePath, setLocalFilePath] = useState<string | null>(null);

    const {
      control,
      handleSubmit,
      setValue,
      watch,
      formState: { errors, isValid },
    } = useForm<ReportFormValues>({
      mode: "onChange",
      defaultValues: {
        AccesionNumber: "",
        Key: "",
      },
    });

    // Load persisted accession number on mount
    useEffect(() => {
      async function loadSaved() {
        const saved = await storageService.getAccessionNumber();
        if (saved) {
          setValue("AccesionNumber", saved, { shouldValidate: true });
        }
      }
      loadSaved();
    }, [setValue]);

    // Handle cancel from parent
    useEffect(() => {
      if (cancel) {
        hideDialog();
      }
    }, [cancel]);

    // Parse scanned QR value
    useEffect(() => {
      if (!scanValue) return;

      if (checkIsJsonService.isJson(scanValue)) {
        try {
          const parsed =
            typeof scanValue === "string" ? JSON.parse(scanValue) : scanValue;
          const acc = parsed.AccesionNumber || parsed.accessionNumber || "";
          const key = parsed.Key || parsed.key || "";
          if (acc) setValue("AccesionNumber", acc, { shouldValidate: true });
          if (key) setValue("Key", key, { shouldValidate: true });
        } catch {
          setValue("Key", scanValue, { shouldValidate: true });
        }
      } else {
        setValue("Key", scanValue, { shouldValidate: true });
      }
    }, [scanValue, setValue]);

    // Save accession number when changed
    useEffect(() => {
      const subscription = watch((value) => {
        if (value.AccesionNumber) {
          storageService.saveAccessionNumber(value.AccesionNumber);
        }
      });
      return () => subscription.unsubscribe();
    }, [watch]);

    const hideDialog = () => {
      fileService.cancelDownload();
      setDialogVisible(false);
      setDownloadProgress(null);
    };

    const openReport = async () => {
      const target = localFilePath || pdfUrl;
      if (target) {
        try {
          await fileService.openReport(target);
        } catch (err: any) {
          Alert.alert(
            "Error",
            "Could not open document: " + (err?.message || ""),
          );
        }
      }
      hideDialog();
    };

    useImperativeHandle(ref, () => ({
      openReport,
    }));

    const onSubmit = async (data: ReportFormValues) => {
      loading(true);
      try {
        const url = await reportService.getReportUrl(data);
        setPdfUrl(url);
        if (onNotification) {
          onNotification(
            "success",
            "Report Found",
            "Patient report URL retrieved successfully.",
          );
        }
      } catch (err: any) {
        const message = err?.message || "Error getting report";
        if (onNotification) {
          onNotification("error", "Error getting report", message);
        } else {
          Alert.alert("Error getting report", message);
        }
      } finally {
        loading(false);
      }
    };

    const handleDownload = async () => {
      if (!pdfUrl) return;

      setDownloadProgress(0);
      setDialogVisible(true);

      try {
        const savedPath = await fileService.downloadReport(
          pdfUrl,
          (progress) => {
            setDownloadProgress(progress);
          },
        );
        setLocalFilePath(savedPath);
        setDownloadProgress(100);
      } catch (err: any) {
        hideDialog();
        const msg = err?.message || "Failed to download report.";
        if (onNotification) {
          onNotification("error", "Download Error", msg);
        } else {
          Alert.alert("Download Error", msg);
        }
      }
    };

    return (
      <View style={styles.container}>
        {/* Accession Number Input */}
        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="AccesionNumber"
            rules={{ required: "Accession number is required!" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Accession number"
                textColor={theme.colors.onSurface}
                activeOutlineColor={theme.colors.primary}
                outlineColor={
                  errors.AccesionNumber
                    ? theme.colors.error
                    : theme.colors.outline
                }
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
            )}
          />
          {errors.AccesionNumber && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {errors.AccesionNumber.message}
            </HelperText>
          )}
        </View>

        {/* Report Key Input */}
        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="Key"
            rules={{ required: "Report key is required!" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Report key"
                textColor={theme.colors.onSurface}
                activeOutlineColor={theme.colors.primary}
                outlineColor={
                  errors.Key ? theme.colors.error : theme.colors.outline
                }
                secureTextEntry={!isPasswordShow}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                right={
                  <TextInput.Icon
                    icon={isPasswordShow ? "eye-off" : "eye"}
                    color={theme.colors.onSurfaceVariant}
                    onPress={() => setIsPasswordShow(!isPasswordShow)}
                  />
                }
              />
            )}
          />
          {errors.Key && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {errors.Key.message}
            </HelperText>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            disabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Search
          </Button>

          <Button
            mode="contained"
            buttonColor={theme.colors.secondary}
            textColor={theme.colors.onSecondary}
            disabled={!pdfUrl || !isValid}
            onPress={handleDownload}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Download
          </Button>
        </View>

        {/* Status banner when report found */}
        {pdfUrl && (
          <View
            style={[
              styles.readyBanner,
              {
                backgroundColor: theme.dark ? "#0c4a6e" : "#eff6ff",
                borderColor: theme.dark ? "#0284c7" : "#bfdbfe",
              },
            ]}
          >
            <Text
              style={[
                styles.readyTitle,
                { color: theme.dark ? "#bae6fd" : "#1e40af" },
              ]}
            >
              Report ready for download!
            </Text>
          </View>
        )}

        {/* Download Dialog */}
        <DownloadDialog
          show={dialogVisible}
          cancel={hideDialog}
          open={openReport}
          downloadProgress={downloadProgress}
          title={
            downloadProgress !== null && downloadProgress >= 100
              ? "Successfully downloaded!"
              : "Downloading report..."
          }
          reportUrl={pdfUrl}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 8,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    fontSize: 15,
  },
  errorText: {
    paddingHorizontal: 4,
    color: "#dc2626",
  },
  buttonsContainer: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    marginVertical: 4,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  readyBanner: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  readyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e40af",
  },
  readyUrl: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
});

export default ReportForm;
