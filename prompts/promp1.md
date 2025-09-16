# ROLE
you are a senior devOps engineer

# Context
Inspect the @README.md file and the @docker-compose.yml file to understand the project and the environment.
See how to set up a github actions workflow fon Node.js projects on @web https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs and https://github.com/actions/setup-node/.

# Task
Create a GitHub Actions workflow in YAML formatt that will:.
 1. Will be executed on every push and pull request to the main branch.
 2. The workflow will only execute:
    - @backend tests
    - backend build
 3. create the file inside the folder @.github/workflows

# Extra considerations
The steps I mention are based on my limited knowledge on GitHub actions set up, so if you consider there are other steps needed you can add them explaining to me why they are needed.

---
is it posible to get the @backend-ci.yml#L18-20  database environment variables from the @.env file?