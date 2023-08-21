import Cache from "./interfaces/Cache.js";
import * as fs from 'fs'
import * as path from 'path'
import { Readable } from "stream";

export class LocalCache implements Cache{
    directory: string
    constructor(directory: string) {
        this.directory = directory
    }
    hasFile(filename: string) {
        if(fs.existsSync(path.join(this.directory,filename))){
            return true
        }
        return false
    }
    getFileUrl(filename: string) {
        if(this.hasFile(filename)) {
            return path.join(this.directory,filename)
        }
        else {
            throw new Error("File does not exist.") 
        }
    }
    writeFile(filename: string, localFileUrl: string) {
        let buffer = fs.readFileSync(path.join(this.directory,localFileUrl))
        fs.writeFileSync(path.join(this.directory,filename), buffer, {flag:"a+"})
    }
    writeFileStream(filename: string, stream: Readable) {
        let writeStream = fs.createWriteStream(path.join(this.directory,filename))
        stream.pipe(writeStream)
        writeStream.end()
    }

}