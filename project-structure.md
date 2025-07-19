# Project Structure

```
D:/Nex/Projects/AI-learning-platfrom/learning-with-ai - Copy/
├───.env
├───.gitignore
├───components.json
├───drizzle.config.js
├───jsconfig.json
├───middleware.js
├───next.config.mjs
├───package-lock.json
├───package.json
├───postcss.config.mjs
├───README.md
├───Test-Youtube-Json.json
├───.next/
│   ├───app-build-manifest.json
│   ├───build-manifest.json
│   ├───package.json
│   ├───react-loadable-manifest.json
│   ├───trace
│   ├───cache/
│   │   ├───.rscinfo
│   │   ├───images/
│   │   │   ├───-S6mO3m3X0DnsUzo9MEH7kGHw0O0TOEr_LOfDqOw-74/
│   │   │   ├───9AKjOlxhsXIdbjka1lvag_vSUpeyeZkEwaSxjZKaJBA/
│   │   │   ├───AVAU2H5jh4NLSaZRGr-BTSp0eXLTDa7w6yQg16eDNp8/
│   │   │   ├───AyRKeSXOw82CTVDFcz3ofucILQzQGrj7zxF8yc8xQaQ/
│   │   │   ├───CmVCm45GtUIvSSlXbFF9a6zOPgywayIxRf-h2tFWm8Q/
│   │   │   ├───ghccPm5-YIax0f7InizKaGwwd7YpOcIDtTLn4Yh-PCQ/
│   │   │   ├───mARQ-CCkYcCAYg5vPCpFcE77LUEMAM8DQoVj5wGDuuE/
│   │   │   ├───NQtP_Lhc9ibchv9Va1x1skzT6rlJC-9Tu-VSgzRUSFE/
│   │   │   ├───ovd7Rt7su4WbR2SykwPmOOp7K87jj06QHUjTN6CwRzI/
│   │   │   ├───q0k6q_LIdptq4nP6zCJW_Rs7EJC3zQs9bbK_wWye8Xs/
│   │   │   ├───tVMOQ_xe8h5bqn3_Bst5HQ5tpE4233dzYsPrGzBzVl0/
│   │   │   ├───VJVT8_XV8f9_NNYRRMZkZiD-wf-SeDhWxuDF8FwLixk/
│   │   │   └───xjO8ToQDQyH0RLfL_9bJXci5FU6BDNWojJRtoXwfsWI/
│   │   ├───swc/
│   │   │   └───plugins/
│   │   └───webpack/
│   │       ├───client-development/
│   │       ├───client-development-fallback/
│   │       ├───edge-server-development/
│   │       └───server-development/
│   ├───server/
│   │   ├───app-paths-manifest.json
│   │   ├───edge-runtime-webpack.js
│   │   ├───interception-route-rewrite-manifest.js
│   │   ├───middleware-build-manifest.js
│   │   ├───middleware-manifest.json
│   │   ├───middleware-react-loadable-manifest.js
│   │   ├───middleware.js
│   │   ├───next-font-manifest.js
│   │   ├───next-font-manifest.json
│   │   ├───pages-manifest.json
│   │   ├───server-reference-manifest.js
│   │   ├───server-reference-manifest.json
│   │   ├───webpack-runtime.js
│   │   ├───app/
│   │   │   ├───page_client-reference-manifest.js
│   │   │   ├───page.js
│   │   │   ├───_not-found/
│   │   │   ├───api/
│   │   │   └───workspace/
│   │   ├───static/
│   │   │   └───webpack/
│   │   └───vendor-chunks/
│   │       ├───@clerk.js
│   │       ├───@floating-ui.js
│   │       ├───@google.js
│   │       ├───@radix-ui.js
│   │       ├───@swc.js
│   │       ├───agent-base.js
│   │       ├───aria-hidden.js
│   │       ├───asynckit.js
│   │       ├───axios.js
│   │       ├───base64-js.js
│   │       ├───bignumber.js.js
│   │       ├───buffer-equal-constant-time.js
│   │       ├───call-bind-apply-helpers.js
│   │       ├───class-variance-authority.js
│   │       ├───clsx.js
│   │       ├───combined-stream.js
│   │       ├───cookie.js
│   │       ├───debug.js
│   │       ├───delayed-stream.js
│   │       ├───dequal.js
│   │       ├───drizzle-orm.js
│   │       ├───dunder-proto.js
│   │       ├───ecdsa-sig-formatter.js
│   │       ├───es-define-property.js
│   │       ├───es-errors.js
│   │       ├───es-object-atoms.js
│   │       ├───es-set-tostringtag.js
│   │       ├───extend.js
│   │       ├───follow-redirects.js
│   │       ├───form-data.js
│   │       ├───function-bind.js
│   │       ├───gaxios.js
│   │       ├───gcp-metadata.js
│   │       ├───get-intrinsic.js
│   │       ├───get-nonce.js
│   │       ├───get-proto.js
│   │       ├───google-auth-library.js
│   │       ├───google-logging-utils.js
│   │       ├───gopd.js
│   │       ├───gtoken.js
│   │       ├───has-symbols.js
│   │       ├───has-tostringtag.js
│   │       ├───hasown.js
│   │       ├───https-proxy-agent.js
│   │       ├───is-stream.js
│   │       ├───json-bigint.js
│   │       ├───jwa.js
│   │       ├───jws.js
│   │       ├───lucide-react.js
│   │       ├───math-intrinsics.js
│   │       ├───mime-db.js
│   │       ├───mime-types.js
│   │       ├───ms.js
│   │       ├───next-themes.js
│   │       ├───next.js
│   │       ├───node-fetch.js
│   │       ├───postgres.js
│   │       └───proxy-from-env.js
│   ├───static/
│   │   ├───chunks/
│   │   ├───css/
│   │   ├───development/
│   │   ├───media/
│   │   └───webpack/
│   └───types/
│       ├───cache-life.d.ts
│       ├───package.json
│       └───app/
├───app/
│   ├───favicon.ico
│   ├───globals.css
│   ├───layout.js
│   ├───page.js
│   ├───provider.jsx
│   ├───(auth)/
│   │   ├───sign-in/
│   │   └───sign-up/
│   ├───api/
│   │   ├───courses/
│   │   ├───enroll/
│   │   ├───generate-course/
│   │   ├───generate-course-layout/
│   │   └───user/
│   ├───course/
│   │   ├───_components/
│   │   └───[courseId]/
│   └───workspace/
│       ├───layout.jsx
│       ├───page.jsx
│       ├───provider.jsx
│       ├───_components/
│       ├───edit-course/
│       ├───explore/
│       ├───how-it-works/
│       ├───learning/
│       ├───profile/
│       └───view-course/
├───components/
│   └───ui/
│       ├───accordion.jsx
│       ├───button.jsx
│       ├───dialog.jsx
│       ├───input.jsx
│       ├───progress.jsx
│       ├───select.jsx
│       ├───separator.jsx
│       ├───sheet.jsx
│       ├───sidebar.jsx
│       ├───skeleton.jsx
│       ├───sonner.jsx
│       ├───switch.jsx
│       ├───textarea.jsx
│       └───tooltip.jsx
├───config/
│   ├───db.js
│   └───schema.js
├───context/
│   ├───SelectedChapterIndexContext.jsx
│   └───UserDetailContext.jsx
├───drizzle/
│   ├───0000_fat_cammi.sql
│   └───meta/
│       ├───_journal.json
│       └───0000_snapshot.json
├───hooks/
│   └───use-mobile.js
├───lib/
│   └───utils.js
└───public/
    ├───file.svg
    ├───globe.svg
    ├───logo.svg
    ├───next.svg
    ├───vercel.svg
    └───window.svg
```
