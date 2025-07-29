import { useState } from "react";

export function useDownloadManager() {
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [filename, setFilename] = useState<string>("");

  const updateDownloadUrl = (url: string, name: string) => {
    setDownloadUrl(url);
    setFilename(name);
  };

  const resetDownload = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
    setFilename("");
  };

  return {
    downloadUrl,
    filename,
    updateDownloadUrl,
    resetDownload,
  };
}
