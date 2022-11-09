"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var github = require("@actions/github");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var myToken, excludeReleaseTypes, topList, excludeDraft, excludePrerelease, excludeRelease, octokit, releaseList, i, releaseListElement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    myToken = core.getInput('myToken');
                    excludeReleaseTypes = core.getInput('exclude_types').split('|');
                    topList = +core.getInput('view_top');
                    excludeDraft = excludeReleaseTypes.some(function (f) { return f === "draft"; });
                    excludePrerelease = excludeReleaseTypes.some(function (f) { return f === "prerelease"; });
                    excludeRelease = excludeReleaseTypes.some(function (f) { return f === "release"; });
                    octokit = github.getOctokit(myToken);
                    return [4 /*yield*/, octokit.repos.listReleases({
                            repo: github.context.repo.repo,
                            owner: github.context.repo.owner,
                            per_page: topList,
                            page: 1
                        })];
                case 1:
                    releaseList = _a.sent();
                    // Search release list for latest required release
                    if (core.isDebug()) {
                        core.debug("Found ".concat(releaseList.data.length, " releases"));
                        releaseList.data.forEach(function (el) { return WriteDebug(el); });
                    }
                    for (i = 0; i < releaseList.data.length; i++) {
                        releaseListElement = releaseList.data[i];
                        if ((!excludeDraft && releaseListElement.draft) ||
                            (!excludePrerelease && releaseListElement.prerelease) ||
                            (!excludeRelease && !releaseListElement.prerelease && !releaseListElement.draft)) {
                            core.debug("Chosen: ".concat(releaseListElement.id));
                            setOutput(releaseListElement);
                            break;
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Setup action output values
 * @param release - founded release
 */
function setOutput(release) {
    core.setOutput('id', release.id);
    core.setOutput('name', release.id);
    core.setOutput('tag_name', release.tag_name);
    core.setOutput('created_at', release.created_at);
    core.setOutput('draft', release.draft);
    core.setOutput('prerelease', release.prerelease);
    core.setOutput('release', !release.prerelease && !release.draft);
    core.setOutput('upload_url', release.upload_url);
}
/**
 * Write debug
 * @param release - founded release
 */
function WriteDebug(release) {
    core.debug("id: ".concat(release.id));
    core.debug("name: ".concat(release.name));
    core.debug("tag_name: ".concat(release.tag_name));
    core.debug("created_at: ".concat(release.created_at));
    core.debug("draft: ".concat(release.draft));
    core.debug("prerelease: ".concat(release.prerelease));
}
run();
