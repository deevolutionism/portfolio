# AWS Deployment

This site deploys as a static Next.js export from GitHub Actions to S3, then invalidates CloudFront.

The Next config uses `output: 'export'` and `trailingSlash: true`, so routes are emitted as directory indexes such as `posts/example/index.html`.

## GitHub Variables

Create a `production` environment in GitHub and add these environment variables:

- `AWS_ROLE_TO_ASSUME`: IAM role ARN that GitHub Actions can assume with OIDC.
- `AWS_REGION`: AWS region for the S3 bucket, for example `us-east-1`.
- `S3_BUCKET`: S3 bucket name that CloudFront serves from.
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID.

## IAM Trust Policy

Replace `OWNER`, `REPO`, and `AWS_ACCOUNT_ID` before attaching this trust policy to the deploy role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:environment:production"
        }
      }
    }
  ]
}
```

## IAM Permissions Policy

Replace `S3_BUCKET`, `AWS_ACCOUNT_ID`, and `CLOUDFRONT_DISTRIBUTION_ID`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::S3_BUCKET"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::S3_BUCKET/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::AWS_ACCOUNT_ID:distribution/CLOUDFRONT_DISTRIBUTION_ID"
    }
  ]
}
```

## CloudFront Routing

Use one of these approaches so clean URLs resolve correctly:

- S3 static website origin: set the S3 website index document to `index.html`, then use the bucket website endpoint as the CloudFront origin.
- Private S3 REST origin with OAC: add a CloudFront Function that rewrites extensionless paths to `index.html`.

For the private S3 option, a viewer-request function can use this shape:

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
```
