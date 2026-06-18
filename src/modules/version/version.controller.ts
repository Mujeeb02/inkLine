import { VersionService } from "./version.service";

export class VersionController {
  static async list(documentId: string, userId: string) {
    const result = await VersionService.listVersions(documentId, userId);
    return { success: true, versions: result };
  }

  static async get(versionId: string, userId: string) {
    const result = await VersionService.getVersion(versionId, userId);
    return { success: true, version: result };
  }

  static async restore(versionId: string, userId: string) {
    const result = await VersionService.restoreVersion(versionId, userId);
    return { success: true, document: result };
  }
}
