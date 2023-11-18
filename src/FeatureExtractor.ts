import Downloader from "./Downloader.js"
import { LocalCache } from "./LocalCache.js"
import Cache from "./interfaces/Cache.js"
import { InferenceSession, Tensor } from "onnxruntime-web";
import * as Jimp from 'jimp';


let MODELS = {
    "dinov2_small": "https://zeroshot-prod-models.s3.us-west-2.amazonaws.com/dinov2_onnx/dinov2_small.onnx",
    "dinov2_base": "",
}

export default class FeatureExtractor {
    name: string
    path: string
    cache: Cache
    downloader: Downloader
    model: Promise<InferenceSession>
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
        this.model = InferenceSession.create(this.path, {executionProviders: ["webgl"]})
    }
    async process(imagePath: string, dims: number[] = [1, 3, 224, 224]) {
        var image = await Jimp.default.read(imagePath)
        // I have no idea.
        var imageBufferData = image.bitmap.data;
        const [redArray, greenArray, blueArray] = new Array(new Array<number>(), new Array<number>(), new Array<number>());
      
        // 2. Loop through the image buffer and extract the R, G, and B channels
        for (let i = 0; i < imageBufferData.length; i += 4) {
          redArray.push(imageBufferData[i]);
          greenArray.push(imageBufferData[i + 1]);
          blueArray.push(imageBufferData[i + 2]);
          // skip data[i + 3] to filter out the alpha channel
        }
      
        // 3. Concatenate RGB to transpose [224, 224, 3] -> [3, 224, 224] to a number array
        const transposedData = redArray.concat(greenArray).concat(blueArray);
      
        // 4. convert to float32
        let i, l = transposedData.length; // length, we need this for the loop
        // create the Float32Array size 3 * 224 * 224 for these dimensions output
        const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
        for (i = 0; i < l; i++) {
          float32Data[i] = transposedData[i] / 255.0; // convert to float
        }
        // 5. create the tensor object from onnxruntime-web.
        const inputTensor = new Tensor("float32", float32Data, dims);
        return inputTensor;
    }
}