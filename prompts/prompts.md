## PROMPT 1

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
## PROMPT 2
is it posible to get the @backend-ci.yml#L18-20  database environment variables from the @.env file?

---
## PROMPT 3

# ROLE
you are a senior devOps engineer

# Context
Inspect the @README.md file and the @docker-compose.yml file to understand the project and the environment.
Github repository environments variables:
 - AWS_ACCESS_ID
 - AWS_ACCESS_KEY
 - EC2_INSTANCE - EC2 instance public DNS 
 - EC2_SSH_PRIVATE_KEY

# Task
1. You have to add the deployment step to the GitHub Actions workflow @backend-ci.yml to deploy the backend to EC2 instance, so taking into account the @backend folder and the application context explain to me the steps need it to make this deployment efective.
2. Modify the GitHub Actions workflow @backend-ci.yml to:
 a. Add the deployment step to the GitHub Actions workflow @backend-ci.yml to deploy the backend to EC2 instance.
 b. Tell me if more secrets are needed in my github actions secrets to make this deployment work correctly.

# Extra considerations
The steps I mention are based on my limited knowledge on GitHub actions set up and EC2 deployment, so if you consider there are other steps needed you can add them explaining to me why they are needed.
---
## PROMPT 4
can you also automate this step Set up SSL certificates for HTTPS

---
## PROMPT 5
can you explain me step by step and in an easy way how to run the deploy to EC2. 
How shoud i run the One-time setup?