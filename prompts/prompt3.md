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