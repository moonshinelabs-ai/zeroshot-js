import { Readable } from "stream";

export default interface Cache {
    hasFile: (filename: string) => boolean;
    getFileUrl: (filename: string) => string;
    writeFile: (filename: string, localFileUrl: string) => void
    writeFileStream: (filename: string, localFileUrl: Readable) => void
}