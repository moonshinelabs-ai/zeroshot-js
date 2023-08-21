import Cache from "./interfaces/Cache.js";
import axios from 'axios';
import sjcl from 'sjcl'
import { Readable } from "stream";

export default class Downloader {
    cache: Cache
    constructor(cache: Cache) {
        this.cache = cache
    }
    fetchModel(url: string) {
        let filePath = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(url))
        if(!this.cache.hasFile(filePath)) {
            axios.get<Readable>(url, {responseType: 'stream'}).then((response) =>{
                this.cache.writeFileStream(filePath,response.data)
            }
            ).catch((error) => {
                throw Error(`Couldn't fetch file:${error}`)
            }
            )
        }
        return this.cache.getFileUrl(filePath)
    }
}