import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import type { TenantConfig } from "../../services/types";
import {
  QRSectionCard,
  QRContainer,
  QRInfo,
  QRTitle,
  QRDescription,
  LinkInputContainer,
  ReadOnlyInput,
  ActionButtonsGroup,
  SecondaryActionButton,
} from "./ShareQRSection.styles";

interface ShareQRSectionProps {
  tenant: TenantConfig;
  reportingUrl: string;
}

export const ShareQRSection: React.FC<ShareQRSectionProps> = ({
  tenant,
  reportingUrl,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const downloadQR = () => {
    try {
      const canvas = document.getElementById(
        "tenant-qr-code",
      ) as HTMLCanvasElement | null;
      if (!canvas) return;
      const pngUrl = canvas.toDataURL("image/png");
      triggerDownload(
        pngUrl,
        `${tenant.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`,
      );
    } catch (err) {
      console.warn(
        "Canvas is tainted by cross-origin logo. Falling back to QR code without logo.",
        err,
      );
      const fallbackCanvas = document.getElementById(
        "tenant-qr-code-fallback",
      ) as HTMLCanvasElement | null;
      if (!fallbackCanvas) return;
      const pngUrl = fallbackCanvas.toDataURL("image/png");
      triggerDownload(
        pngUrl,
        `${tenant.name.toLowerCase().replace(/\s+/g, "-")}-qr-no-logo.png`,
      );
      alert(
        t(
          "dashboard.qrDownloadTaintedWarning",
          "The logo image is hosted on an external server that does not allow downloads. The QR code has been downloaded successfully, but without the logo. To include the logo, please upload it to your local server or use a CORS-enabled URL.",
        ),
      );
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <QRSectionCard>
      <QRContainer>
        <QRCodeCanvas
          id="tenant-qr-code"
          value={reportingUrl}
          size={160}
          level="H"
          includeMargin={true}
          imageSettings={
            tenant.logo_url
              ? {
                  src: tenant.logo_url,
                  height: 32,
                  width: 32,
                  excavate: true,
                }
              : undefined
          }
        />
      </QRContainer>
      {/* Hidden fallback QR code without logo for tainted canvas downloads */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas
          id="tenant-qr-code-fallback"
          value={reportingUrl}
          size={160}
          level="L"
          includeMargin={true}
        />
      </div>
      <QRInfo>
        <QRTitle
          variant="h6"
          as="h3"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <QrCodeIcon sx={{ color: "var(--primary)" }} />
          {t("dashboard.qrTitle", "Share Public Reporting Form")}
        </QRTitle>
        <QRDescription variant="body2">
          {t(
            "dashboard.qrDescription",
            "Place this QR code on physical stickers, posters, or equipment around your site. Users can scan the QR code to instantly submit issues to your system without signing in.",
          )}
        </QRDescription>

        <LinkInputContainer>
          <ReadOnlyInput
            type="text"
            readOnly
            value={reportingUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            data-testid="qr-url-input"
          />
          <ActionButtonsGroup>
            <SecondaryActionButton
              variant="outlined"
              onClick={copyToClipboard}
              data-testid="copy-qr-link-button"
            >
              {copied ? (
                <CheckIcon sx={{ color: "#81c784" }} />
              ) : (
                <ContentCopyIcon />
              )}
              {copied
                ? t("dashboard.copied", "Copied!")
                : t("dashboard.copyLink", "Copy Link")}
            </SecondaryActionButton>

            <SecondaryActionButton
              variant="outlined"
              onClick={downloadQR}
              data-testid="download-qr-button"
            >
              <DownloadIcon />
              {t("dashboard.downloadQR", "Download QR (PNG)")}
            </SecondaryActionButton>
          </ActionButtonsGroup>
        </LinkInputContainer>
      </QRInfo>
    </QRSectionCard>
  );
};
