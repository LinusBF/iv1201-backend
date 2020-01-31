gcloud builds submit --project global-application-example --tag "gcr.io/global-application-example/global-apps-backend" && \
gcloud run deploy "global-apps-backend" --project global-application-example --region europe-west1 --no-allow-unauthenticated --image "gcr.io/global-application-example/global-apps-backend" --platform managed
