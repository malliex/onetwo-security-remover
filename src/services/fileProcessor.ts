import { XMLBuilder, XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import type { ProgressCb } from "../types/progress";

const GROUP_KEYS = [
  "accessGroup",
  "@_accessGroup",
  "accessGroupui",
  "@_accessGroupui",
  "maintenanceGroup",
  "@_maintenanceGroup",
  "maintenanceGroupui",
  "@_maintenanceGroupui",
  "readWriteDataGroup",
  "@_readWriteDataGroup",
  "readWriteDataGroupui",
  "@_readWriteDataGroupui",
  "readWriteDataGroup2",
  "@_readWriteDataGroup2",
  "readWriteDataGroupui2",
  "@_readWriteDataGroupui2",
  "readDataGroup",
  "@_readDataGroup",
  "readDataGroup2",
  "@_readDataGroup2",
  "readDataGroupui2",
  "@_readDataGroupui2",
  "calculateFromGridsGroup",
  "@_calculateFromGridsGroup",
  "displayMemberGroup",
  "@_displayMemberGroup",
  "WorkflowExecutionGroup",
  "@_WorkflowExecutionGroup",
  "CertificationSignOffGroup",
  "@_CertificationSignOffGroup",
  "JournalProcessGroup",
  "@_JournalProcessGroup",
  "JournalApprovalGroup",
  "@_JournalApprovalGroup",
  "JournalPostGroup",
  "@_JournalPostGroup",
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  preserveOrder: false,
  cdataPropName: "#cdata",
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  suppressEmptyNode: false,
  preserveOrder: false,
  cdataPropName: "#cdata",
  processEntities: true,
  suppressBooleanAttributes: false,
});

export async function processSingleXml(
  file: File,
  targetGroup: string
): Promise<{ blob: Blob; filename: string }> {
  const text = await file.text();
  const json = parser.parse(text);

  transformGroupFields(json, targetGroup);

  const updatedXml = builder.build(json);
  const blob = new Blob([updatedXml], { type: "application/xml" });

  const name = file.name.replace(/\.xml$/i, "") + "_CLEANED.xml";

  return { blob, filename: name };
}

export async function processZipFile(
  zipFile: File,
  targetGroup: string,
  onProgressUpdate?: ProgressCb
): Promise<{ blob: Blob; filename: string }> {
  const zip = await JSZip.loadAsync(zipFile);
  const outputZip = new JSZip();

  const xmlEntries = Object.values(zip.files).filter((file) =>
    file.name.endsWith(".xml")
  );

  let current = 0;
  for (const entry of xmlEntries) {
    const xmlText = await entry.async("text");
    const json = parser.parse(xmlText);

    transformGroupFields(json, targetGroup);

    const updatedXml = builder.build(json);
    outputZip.file(entry.name, updatedXml);

    current++;
    onProgressUpdate?.(current, xmlEntries.length);
  }

  const blob = await outputZip.generateAsync({ type: "blob" });
  const name = zipFile.name.replace(/\.zip$/i, "") + "_CLEANED.zip";

  return { blob, filename: name };
}

function transformGroupFields(node: any, targetGroup: string) {
  if (typeof node !== "object" || node === null) return;

  for (const key of Object.keys(node)) {
    const value = node[key];

    if (key === "attribute" && typeof value === "object") {
      const attributes = Array.isArray(value) ? value : [value];

      attributes.forEach((attr: any) => {
        const attrName = attr?.["@_attributeName"];
        if (GROUP_KEYS.includes(attrName)) {
          attr["@_attributeValue"] = targetGroup;
        }
      });
    }

    // Regular key replacement (either attribute or element)
    if (GROUP_KEYS.includes(key)) {
      node[key] = targetGroup;
    } else if (typeof value === "object") {
      transformGroupFields(value, targetGroup); // Recurse into children
    }
  }
}
