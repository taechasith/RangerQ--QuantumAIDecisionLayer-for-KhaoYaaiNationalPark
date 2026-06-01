import { PageHeader } from "@/components/layout/PageHeader";
import { ImportWorkspace } from "@/components/imports/ImportWorkspace";

export default function ImportsPage() {
  return (
    <>
      <PageHeader
        title="Data Imports"
        description="Upload SMART-style patrol exports, camera detections, visitor pressure CSVs, and manual ranger notes into the Google Apps Script / Sheets backend."
      />
      <ImportWorkspace />
    </>
  );
}
