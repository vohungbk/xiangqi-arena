<!-- pm-qa-plugin:start — managed block, edit freely -->
## PM/QA Plugin

@project.yaml

> Path defaults (if `project.yaml` has no `paths:` section): `context_dir` → `business-context/`, `requirements_dir` → `requirements/`, `testing_dir` → `testing/`

## Project Context Rule (REQUIRED)

Each skill specifies which context files it loads. All context files live in `business-context/`.

If context files are missing, suggest running `/generate-project-context` first.
<!-- pm-qa-plugin:end -->
