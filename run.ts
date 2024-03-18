// async function dataCollection(fileName: string) {

//   //issueID
//   const getFileDetailsResponse = await octokit.request(
//     `GET /repos/code-423n4/2022-01-dev-test-repo-findings/contents/data/${fileName}`,
//     {
//       owner: "code-423n4",
//       repo: "2022-01-dev-test-repo-findings",
//       path: "data/BurgerTime-11.json",
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//     }
//   );
//   const fileDetails = getFileDetailsResponse.data;
//   let fileContentPromise = await fetch(fileDetails.download_url, {
//     method: "GET",
//   });
//   let fileContent = await fileContentPromise.json();
//   let IssueIdValue: number = fileContent.issueId;
//   // console.log("issueid : " + IssueIdValue);

//   //IssueTille
//   let tags = await octokit.request(
//     `GET /repos/code-423n4/2022-01-dev-test-repo-findings/issues/${IssueIdValue}`,
//     {
//       owner: "code-423n4",
//       repo: "2022-01-dev-test-repo-findings",
//       issue_number: IssueIdValue,
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//     }
//   );

//   let repoIssueTitle = tags.data.title;
//   // console.log("Issue Title: " + repoIssueTitle);

//   //Tags
//   let repoIssueDetail = tags.data.labels;
//   const labelsName: string[] = [];

//   for (let i = 0; i < repoIssueDetail.length; i++) {
//     labelsName.push(repoIssueDetail[i].name);
//   }

//   let finalResponse: IssueSummary = {
//     issueId: IssueIdValue,
//     issueTitle: repoIssueTitle,
//     name: labelsName,
//   };

//   let issueSummaryOfOneFile: IssueSummary[] = [];
//   issueSummaryOfOneFile.push(finalResponse);
//   // console.log(finalResponse);
// }
// interface RepoFile {
//   name: string;
// }

// //File Names
// async function repoFilesName(prefix: string) {
//   const getFileDetailsResponse = await octokit.request(
//     "GET /repos/code-423n4/2022-01-dev-test-repo-findings/contents/data/",
//     {
//       owner: "code-423n4",
//       repo: "2022-01-dev-test-repo-findings",
//       path: "data/BurgerTime-11.json",
//       headers: {
//         "X-GitHub-Api-Version": "2022-11-28",
//       },
//     }
//   );
//   const fileDetails: RepoFile[] = getFileDetailsResponse.data;
//   const regex = new RegExp(`^${prefix}-[0-9]+\.json$`);

//   for (let i = 0; i < fileDetails.length; i++) {
//     let filename: RepoFile = fileDetails[i];
//     if (regex.test(filename.name)) {
//       console.log(filename.name);
//       await dataCollection(filename.name);
//     }
//   }
// }

// repoFilesName("nighthawk");
import { Octokit } from "@octokit/core";
import "dotenv/config";
interface Response {
  issueSummary: IssueSummary[];
}
interface IssueSummary {
  issueId: number;
  issueTitle: string;
  tags: string[];
}
interface RepoFile {
  name: string;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_AUTH_TOKEN,
});
async function fetchFileDetails(fileName: string) {
  const getFileDetailsResponse = await octokit.request(
    `GET /repos/code-423n4/2022-01-dev-test-repo-findings/contents/data/${fileName}`,
    {
      owner: "code-423n4",
      repo: "2022-01-dev-test-repo-findings",
      path: `data/${fileName}`,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return getFileDetailsResponse.data;
}

async function fetchIssueID(downloadUrl: string) {
  let fileContentPromise = await fetch(downloadUrl, {
    method: "GET",
  });
  let fileContent = await fileContentPromise.json();

  return fileContent.issueId;
}

async function fetchIssueDetails(issueId: number) {
  return await octokit.request(
    `GET /repos/code-423n4/2022-01-dev-test-repo-findings/issues/${issueId}`,
    {
      owner: "code-423n4",
      repo: "2022-01-dev-test-repo-findings",
      issue_number: issueId,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
}

function extractLabels(issueDetails: any) {
  const labelsName: string[] = [];
  for (let i = 0; i < issueDetails.length; i++) {
    labelsName.push(issueDetails[i].name);
  }
  return labelsName;
}

async function repoFilesName(prefix: string) {
  const getFileDetailsResponse = await octokit.request(
    "GET /repos/code-423n4/2022-01-dev-test-repo-findings/contents/data/",
    {
      owner: "code-423n4",
      repo: "2022-01-dev-test-repo-findings",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  const fileDetails: RepoFile[] = getFileDetailsResponse.data;
  const regex = new RegExp(`^${prefix}-[0-9]+\.json$`);
  let detail: Response = {
    issueSummary: [],
  };
  for (let i = 0; i < fileDetails.length; i++) {
    let filename: RepoFile = fileDetails[i];
    if (regex.test(filename.name)) {
      console.log(filename.name);
      // await dataCollection(filename.name);
      detail.issueSummary.push(await dataCollection(filename.name));
    }
  }
  console.log(JSON.stringify(detail, null, 4));
  console.log(process.env);
}

async function dataCollection(fileName: string) {
  const fileDetails = await fetchFileDetails(fileName);
  const issueId = await fetchIssueID(fileDetails.download_url);
  const tags = await fetchIssueDetails(issueId);
  const labelsName = extractLabels(tags.data.labels);
  let finalResponse: IssueSummary = {
    issueId: issueId,
    issueTitle: tags.data.title,
    tags: labelsName,
  };
  // console.log(finalResponse);
  return finalResponse;
}

repoFilesName("nighthawk");
