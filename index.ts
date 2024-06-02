import * as core from '@actions/core'
import * as github from '@actions/github'

interface Release {
    id: string;
    tag_name: string;
    prerelease: boolean;
    draft: boolean;
    created_at: string;
    name: string;
    upload_url: string;
}


async function getLastReleaseByTagPattern(octokit: any, owner: string, repo: string, excludeReleaseTypes?: string, tagPattern?: string): Promise<Release | null> {
    let page = 0;
    let releasesFinal: Release[] = [];
    const regex = tagPattern ? new RegExp(tagPattern) : null;
    const excludeTypes = excludeReleaseTypes ? excludeReleaseTypes.split(',') : [];

    while (true) {
        const response = await octokit.rest.repos.listReleases({
            owner,
            repo,
            per_page: 100, // Adjust the number of items per page as needed
            page,
        });

        let releases = response.data as Release[];

        if (core.isDebug()) {
            core.debug(`Releases: ${JSON.stringify(releases, null, 2)}`);
        }
        // Filter releases based on the exclusion criteria and tag matching the specified regex pattern
        const filteredReleases = releases.filter(release => {
            if (core.isDebug()) {
                core.debug(`release -- Inner Loop: ${JSON.stringify(release, null, 2)}`);
            }
            let exclude = false;
            if (excludeTypes.includes('prerelease') && release.prerelease) exclude = true;
            if (core.isDebug()) {
                if (exclude) {
                    core.debug('...exclude prerelease');
                } else {
                    core.debug('...NOT exclude prerelease');
                }
            }
            if (excludeTypes.includes('draft') && release.draft) exclude = true;
            if (core.isDebug()) {
                if (exclude) {
                    core.debug('...exclude draft');
                } else {
                    core.debug('...NOT exclude draft');
                }
            }
            if (excludeTypes.includes('release') && !release.prerelease && !release.draft) exclude = true;
            if (core.isDebug()) {
                if (exclude) {
                    core.debug('...exclude release');
                } else {
                    core.debug('...NOT exclude release');
                }
            }
            if (regex && !regex.test(release.tag_name)) exclude = true;
            if (core.isDebug()) {
                if (exclude) {
                    core.debug('...exclude pattern');
                } else {
                    core.debug('...NOT exclude pattern');
                }
            }
            if (core.isDebug()) {
                if (exclude) {
                    core.debug('...exclude record');
                } else {
                    core.debug('...NOT exclude record');
                }
            }
            return !exclude;

        });

        if (core.isDebug()) {
            core.debug(`Filtered releases: ${JSON.stringify(filteredReleases, null, 2)}`);
        }
        // Add the filtered releases to the overall list of matching releases
        releasesFinal = releasesFinal.concat(filteredReleases);
        if (core.isDebug()) {
            core.debug(`Final releases -- In Loop: ${JSON.stringify(releasesFinal, null, 2)}`);
        }

        if (releases.length === 0) {
            break;
        }

        page++;
    }
    if (core.isDebug()) {
        core.debug(`Final releases: ${JSON.stringify(releasesFinal, null, 2)}`);
    }
    // Sort releases by created_at in descending order and return the most recent one
    releasesFinal.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (core.isDebug()) {
        core.debug(`Final releases (date sort): ${JSON.stringify(releasesFinal, null, 2)}`);
    }
    if (releasesFinal.length > 0) {
        return releasesFinal[0];
    } else {
        throw new Error('No matching releases found');
    }
}
async function run(): Promise<void> {
    // Get input values
    let repo_owner = core.getInput('owner');
    let repo_name = core.getInput('repo');
    const repository = core.getInput('repository');
    const myToken = core.getInput('token');
    const excludeRelease = core.getInput('excludes')
    const excludeReleaseTypes = core.getInput('excludes').split(',');
    const filterTag = core.getInput('filter');
    if (repository) {
        [repo_owner, repo_name] = repository.split("/");
    }
    if (!repo_name && !repo_name) {
        repo_name = github.context.repo.repo;
        repo_owner = github.context.repo.owner;
    }
    try {
        const octokit = github.getOctokit(myToken);
        getLastReleaseByTagPattern(octokit, repo_owner, repo_name, excludeRelease,filterTag) // Pass 'prerelease', 'draft', or both to exclude those types
            .then(release => {
                if (release) {
                    if (core.isDebug()) {
                        console.log(`Most recent release matching the criteria:`);
                        console.log(`${release.name} with tag: ${release.tag_name}, created at: ${release.created_at}`);
                    }
                    setOutput(release);
                }
            })
            .catch(error => {
                console.error(error.message);
                core.setFailed(error.message);
            });
    } catch (err: unknown) {
        if (err instanceof Error) core.error(err.message);
        core.error(String(err));
    }
}


/**
 * Setup action output values
 * @param release - founded release
 */
function setOutput(release: Release): void {
    core.setOutput('id', release.id);
    core.setOutput('name', release.id);
    core.setOutput('tag_name', release.tag_name);
    core.setOutput('version', String(release.tag_name).replace('v', ''));
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
function WriteDebug(release: Record<string, unknown>): void {
    core.debug(`id: ${release.id}`);
    core.debug(`name: ${release.name}`)
    core.debug(`tag_name: ${release.tag_name}`);
    core.debug(`created_at: ${release.created_at}`);
    core.debug(`draft: ${release.draft}`);
    core.debug(`prerelease: ${release.prerelease}`);
}

run();
