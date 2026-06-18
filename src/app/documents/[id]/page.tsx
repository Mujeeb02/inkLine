import { notFound } from "next/navigation";

import { DocumentEditor } from "@/features/documents/components/DocumentEditor";
import { requireUser } from "@/modules/shared/middleware/auth";
import { AppError } from "@/modules/shared/errors";
import { DocumentService } from "@/modules/document/document.service";

export const dynamic = "force-dynamic";

type DocumentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const user = await requireUser();
  const { id } = await params;

  try {
    const document = await DocumentService.getDocumentForUser(id, user._id);
    return <DocumentEditor document={document} currentUser={user} />;
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
