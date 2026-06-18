import { DocumentWorkspace } from "@/features/documents/components/DocumentWorkspace";
import { requireUser } from "@/modules/shared/middleware/auth";
import { DocumentService } from "@/modules/document/document.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const documents = await DocumentService.listDocumentsForUser(user._id);

  return (
    <DocumentWorkspace currentUserEmail={user.email} documents={documents} />
  );
}
