import Downloader from "./Downloader.js"
import { LocalCache } from "./LocalCache.js"
import Cache from "./interfaces/Cache.js"
import * as ort from 'onnxruntime-node';

let MODELS = {
    "dinov2_small": "https://zeroshot-prod-models.s3.us-west-2.amazonaws.com/dinov2_onnx/dinov2_small.onnx",
    "dinov2_base": "",
}

export default class FeatureExtractor {
    name: string
    path: string
    cache: Cache
    downloader: Downloader
    model: Promise<ort.InferenceSession>
    constructor(name: string, cache?: Cache) {
        this.name = name
        this.cache = cache ? cache : new LocalCache("cache")
        this.downloader = new Downloader(this.cache)
        if(!(name in MODELS)) {
            throw new Error(`Model ${name} not found. Possible values are ${Object.keys(MODELS)}`)
        }
        if(this.cache.hasFile(name)) {
            this.path = this.cache.getFileUrl(name)
        }
        else{
            this.path = this.downloader.fetchModel(MODELS[name])
        }
        this.model = ort.InferenceSession.create(this.path)
    }
}