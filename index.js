import express from 'express'
import cron from 'node-cron'
import dotenv from 'dotenv'

dotenv.config({ path: "./.env", override: true, });







import axios from "axios";

const app = express()






const API = "https://macreelinfo.com/api";

// 1. Login
const login = async () => {
    try {
        const response = await axios.post(`${API}/Auth/login`, {
            "username": process.env.USERNAME,
            "password": process.env.PASSWORD,
            "deviceType": "Web"
        });

        const { accessToken, userId } = response.data.data;

        console.log("Login successful. User ID:", userId);
        let commitMessage = await getBranchCommits()
        // 2. Pass the token into Save-Draft
        if (accessToken, userId, commitMessage) {
            await saveDraft(accessToken, userId, commitMessage);
        }

    } catch (error) {
        console.error(
            "Login failed:",
            error.response?.data || error.message
        );
    }
};

// 3. Save draft with authentication
const saveDraft = async (accessToken, userId, commitMessage) => {
    try {
        const response = await axios.post(
            `${API}/Employee/Save-Draft`,
            {
                employeeId: userId,
                projectName: "Darling Desire",
                taskDetail: commitMessage,
                duration: "1 h",
                remarks: "",
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                responseType: "text",
            }
        );

        console.log("Draft saved:", response.status);
        console.log("Response:", response.data || "Empty response body");
    } catch (error) {
        console.error(
            "Save draft failed:",
            error.response?.status,
            error.response?.data || error.message
        );
    }
};





// const getBranchCommits = async ({
//     owner = "macreelinfosoft",
//     repo = "TurningBrain-Web",
//     branch = "main",
//     perPage = 100,
//     page = 1,
// } = {}) => {
//     try {
//         const token = process.env.GITHUB_TOKEN;

//         if (!token) {
//             throw new Error("GITHUB_TOKEN is missing from environment variables");
//         }

//         const url = new URL(
//             `https://api.github.com/repos/${owner}/${repo}/commits`
//         );

//         url.searchParams.set("sha", branch);
//         url.searchParams.set("per_page", String(perPage));
//         url.searchParams.set("page", String(page));

//         const response = await fetch(url, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 Accept: "application/vnd.github+json",
//                 "X-GitHub-Api-Version": "2022-11-28",
//             },
//         });

//         if (!response.ok) {
//             const error = await response.json().catch(() => ({}));

//             throw new Error(
//                 `GitHub API error ${response.status}: ${error.message || response.statusText
//                 }`
//             );
//         }

//         const commits = await response.json();


//         let a = commits.map((item) => ({
//             sha: item.sha,
//             message: item.commit.message,
//             author: item.commit.author?.name ?? null,
//             date: item.commit.author?.date ?? null,
//             url: item.html_url,
//         }));

//         console.log(a, "9999999999999999")

//         return commits.map((item) => ({
//             sha: item.sha,
//             message: item.commit.message,
//             author: item.commit.author?.name ?? null,
//             date: item.commit.author?.date ?? null,
//             url: item.html_url,
//         }));
//     } catch (error) {
//         console.error("Failed to fetch branch commits:", error.message);
//         throw error;
//     }
// };
const getIndiaDate = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

const getBranchCommits = async ({
    owner = "macreelinfosoft",
    repo = "TurningBrain-Web",
    branch = "main",
    date = getIndiaDate(),
    since,
    until,
    perPage = 100,
    page = 1,
} = {}) => {
    try {
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            throw new Error("GITHUB_TOKEN is missing from environment variables");
        }

        const url = new URL(
            `https://api.github.com/repos/${owner}/${repo}/commits`
        );

        url.searchParams.set("sha", branch);
        url.searchParams.set("per_page", String(perPage));
        url.searchParams.set("page", String(page));

        // Fetch commits for a specific calendar date (India time)
        if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new Error("date must be in YYYY-MM-DD format");
            }

            const start = new Date(`${date}T00:00:00+05:30`);
            const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

            // if (Number.isNaN(start.getTime()) ||
            //     start.toISOString().slice(0, 10) !== date) {
            //     throw new Error("Invalid calendar date");
            // }

            const [year, month, day] = date.split("-").map(Number);
            const calendarDate = new Date(Date.UTC(year, month - 1, day));

            if (
                Number.isNaN(start.getTime()) ||
                calendarDate.getUTCFullYear() !== year ||
                calendarDate.getUTCMonth() !== month - 1 ||
                calendarDate.getUTCDate() !== day
            ) {
                throw new Error("Invalid calendar date");
            }

            url.searchParams.set("since", start.toISOString());
            url.searchParams.set(
                "until",
                new Date(end.getTime() - 1000).toISOString()
            );
        } else {
            if (since) url.searchParams.set("since", since);
            if (until) url.searchParams.set("until", until);
        }



        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));

            throw new Error(
                `GitHub API error ${response.status}: ${error.message || response.statusText
                }`
            );
        }

        const commits = await response.json();
        const commitMessage = commits
            .map((item) => item.commit.message)
            .join(", ");


        return commitMessage
    } catch (error) {
        console.error("Failed to fetch branch commits:", error.message);
        throw error;
    }
};





cron.schedule(
    '*/5 * * * *',
    () => {
        console.log("api is ca;lled")
        login()
        saveDraft()
        getBranchCommits()
    },
    {
        timezone: 'Asia/Kolkata',
    }
);





app.listen("8000", () => {
    console.log("runnnnnning")
})