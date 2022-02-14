# Redakcny-system-fe
Frontend part of thesis Collaborative markdown editor

## Deploy frontend app to docker locally

1. Build app based on Dockerfile.
    ``````
    docker build -t redakcny-system-fe .    
    ``````

2. Run built image inside container.
    ``````
    docker run -e BECKEND_API_URL='http://localhost:8080' --name redakcny-system-fe --rm -p 3000:3000 redakcny-system-fe
    ``````
