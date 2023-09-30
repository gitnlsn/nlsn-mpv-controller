var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("utils/execPromise", ["require", "exports", "util", "child_process"], function (require, exports, util_1, child_process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.execPromise = void 0;
    util_1 = __importDefault(util_1);
    exports.execPromise = util_1.default.promisify(child_process_1.exec);
});
define("utils/listFiles", ["require", "exports", "utils/execPromise"], function (require, exports, execPromise_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listFiles = void 0;
    const listFiles = (path) => __awaiter(void 0, void 0, void 0, function* () {
        return (0, execPromise_1.execPromise)(`find ${path} -type f | jq -R '' | jq -s --compact-output`).then(({ stdout, stderr }) => {
            if (stderr.length > 0) {
                throw new Error(stderr);
            }
            return JSON.parse(stdout);
        });
    });
    exports.listFiles = listFiles;
});
define("interfaces/TaskConsumer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("interfaces/AudioPlayer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("interfaces/AudioPlayerCosntructor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utils/playfile", ["require", "exports", "utils/execPromise"], function (require, exports, execPromise_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.playAudio = void 0;
    const playAudio = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
        return (0, execPromise_2.execPromise)(`mpv ${filePath}`);
    });
    exports.playAudio = playAudio;
});
define("utils/randomInteger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomInteger = void 0;
    const randomInteger = (min = 0, max = 1) => {
        const delta = Math.floor(max) - Math.floor(min);
        return Math.floor(min + Math.random() * delta);
    };
    exports.randomInteger = randomInteger;
});
define("utils/playLoop", ["require", "exports", "utils/playfile", "utils/randomInteger"], function (require, exports, playfile_1, randomInteger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.playLoop = void 0;
    const playLoop = (audioFilePahts, beforeAudioCallback) => {
        const abortController = new AbortController();
        const consumerPromise = new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            abortController.signal.addEventListener("abort", () => {
                resolve();
            });
            while (true) {
                const randomIndex = (0, randomInteger_1.randomInteger)(0, audioFilePahts.length - 1);
                yield (beforeAudioCallback === null || beforeAudioCallback === void 0 ? void 0 : beforeAudioCallback());
                yield (0, playfile_1.playAudio)(audioFilePahts[randomIndex]);
            }
        }));
        return {
            abortController,
            consumerPromise,
        };
    };
    exports.playLoop = playLoop;
});
define("utils/wainRandomDelay", ["require", "exports", "utils/randomInteger"], function (require, exports, randomInteger_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.waitRandomDelayFactory = void 0;
    const waitRandomDelayFactory = (min = 0, max = 1) => () => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const randomDelay = (0, randomInteger_2.randomInteger)(min, max);
            setTimeout(() => resolve(), randomDelay);
        });
    });
    exports.waitRandomDelayFactory = waitRandomDelayFactory;
});
define("AudioPlayers/RichAudioPlayer", ["require", "exports", "utils/playLoop", "utils/wainRandomDelay"], function (require, exports, playLoop_1, wainRandomDelay_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RichAudioPlayer = void 0;
    class RichAudioPlayer {
        constructor(props) {
            this.props = props;
            this.taskConsumerList = [];
        }
        play() {
            var _a;
            const taskConsummers = Array.from(Array((_a = this.props.threadsNumber) !== null && _a !== void 0 ? _a : 1).keys()).map(() => (0, playLoop_1.playLoop)(this.props.audioFilePaths, (0, wainRandomDelay_1.waitRandomDelayFactory)(this.props.minDelay, this.props.maxDelay)));
            this.taskConsumerList.push(...taskConsummers);
            return this.getPromises();
        }
        stop() {
            this.taskConsumerList.forEach((task) => task.abortController.abort());
            const taskPromises = this.getPromises();
            this.taskConsumerList = [];
            return taskPromises;
        }
        getPromises() {
            return Promise.all(this.taskConsumerList.map((task) => task.consumerPromise));
        }
    }
    exports.RichAudioPlayer = RichAudioPlayer;
});
define("main", ["require", "exports", "getopts", "utils/listFiles", "AudioPlayers/RichAudioPlayer"], function (require, exports, getopts_1, listFiles_1, RichAudioPlayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    getopts_1 = __importDefault(getopts_1);
    const main = ({ path, threads, minDelay, maxDelay }) => __awaiter(void 0, void 0, void 0, function* () {
        const audioFilePaths = yield (0, listFiles_1.listFiles)(path);
        console.log({
            path,
            threads,
            audioFilePaths,
        });
        const player = new RichAudioPlayer_1.RichAudioPlayer({
            audioFilePaths,
            threadsNumber: threads,
            minDelay,
            maxDelay,
        });
        yield player.play();
        return {
            status: "ok",
        };
    });
    const opts = (0, getopts_1.default)(process.argv.slice(2), {
        string: ["path", "threads", "minDelay", "maxDelay"],
    });
    const { path, threads, minDelay, maxDelay } = opts;
    main({
        path,
        threads: Number.isFinite(Number(threads)) ? Number(threads) : 1,
        minDelay: Number.isFinite(Number(minDelay)) ? Number(minDelay) : 1,
        maxDelay: Number.isFinite(Number(maxDelay)) ? Number(maxDelay) : 1,
    })
        .then((output) => console.log(JSON.stringify(output)))
        .catch(console.error);
});
define("AudioPlayers/OccasionalAudioPlayer", ["require", "exports", "utils/playLoop", "utils/wainRandomDelay"], function (require, exports, playLoop_2, wainRandomDelay_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OccasionalAudioPlayer = void 0;
    class OccasionalAudioPlayer {
        constructor(audioFilePaths, minInterval = 60, maxInterval = 90) {
            this.audioFilePaths = audioFilePaths;
            this.minInterval = minInterval;
            this.maxInterval = maxInterval;
        }
        play() {
            this.taskConsumer = (0, playLoop_2.playLoop)(this.audioFilePaths, (0, wainRandomDelay_2.waitRandomDelayFactory)(this.minInterval, this.maxInterval));
            return this.taskConsumer.consumerPromise;
        }
        stop() {
            if (this.taskConsumer === undefined) {
                return Promise.resolve();
            }
            const taskConsumer = this.taskConsumer;
            this.taskConsumer.abortController.abort();
            this.taskConsumer = undefined;
            return taskConsumer.consumerPromise;
        }
    }
    exports.OccasionalAudioPlayer = OccasionalAudioPlayer;
});
define("AudioPlayers/SimultaneousAudioPlayer", ["require", "exports", "utils/playLoop", "utils/wainRandomDelay"], function (require, exports, playLoop_3, wainRandomDelay_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimultaneousAudioPlayer = void 0;
    class SimultaneousAudioPlayer {
        constructor(audioFilePaths, threadsNumber = 3) {
            this.audioFilePaths = audioFilePaths;
            this.threadsNumber = threadsNumber;
            this.taskConsumerList = [];
        }
        play() {
            const taskConsummers = Array.from(Array(this.threadsNumber).keys()).map(() => (0, playLoop_3.playLoop)(this.audioFilePaths, (0, wainRandomDelay_3.waitRandomDelayFactory)(5, 30)));
            this.taskConsumerList.push(...taskConsummers);
            return this.getPromises();
        }
        stop() {
            this.taskConsumerList.forEach((task) => task.abortController.abort());
            const taskPromises = this.getPromises();
            this.taskConsumerList = [];
            return taskPromises;
        }
        getPromises() {
            return Promise.all(this.taskConsumerList.map((task) => task.consumerPromise));
        }
    }
    exports.SimultaneousAudioPlayer = SimultaneousAudioPlayer;
});
define("AudioPlayers/SingleLayerAudioPlayer", ["require", "exports", "utils/playLoop"], function (require, exports, playLoop_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleLayerAudioPlayer = void 0;
    class SingleLayerAudioPlayer {
        constructor(audioFilePaths) {
            this.audioFilePaths = audioFilePaths;
        }
        play() {
            const consumer = (0, playLoop_4.playLoop)(this.audioFilePaths);
            this.taskConsumer = consumer;
            return consumer.consumerPromise;
        }
        stop() {
            if (this.taskConsumer === undefined) {
                return Promise.resolve();
            }
            const taskConsumer = this.taskConsumer;
            this.taskConsumer.abortController.abort();
            this.taskConsumer = undefined;
            return taskConsumer.consumerPromise;
        }
    }
    exports.SingleLayerAudioPlayer = SingleLayerAudioPlayer;
});
