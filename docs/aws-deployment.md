# AWS Deployment

This site deploys as a static Next.js export from GitHub Actions to S3, then invalidates CloudFront.

The Next config uses `output: 'export'` and `trailingSlash: true`, so routes are emitted as directory indexes such as `posts/example/index.html`.

## Created Resources

- AWS account: `901712715767`
- Hosted zone: `Z0521140QGVIRF46HEL0`
- S3 bucket: `gentrydemchak-portfolio-site`
- CloudFront distribution: `E3QAVS6FHUP3ED`
- CloudFront domain: `d51kfvr58otrx.cloudfront.net`
- ACM certificate: `arn:aws:acm:us-east-1:901712715767:certificate/4f5217e2-28a7-4f5e-b656-3abee0eee151`
- GitHub deploy role: `arn:aws:iam::901712715767:role/github-actions-portfolio-deploy`
- GitHub environment: `production`

DNS for `gentrydemchak.com` has not been cut over yet. The current apex record still points to GitHub Pages.

## GitHub Variables

The `production` environment in GitHub has these environment variables:

- `AWS_ROLE_TO_ASSUME`: `arn:aws:iam::901712715767:role/github-actions-portfolio-deploy`
- `AWS_REGION`: `us-east-1`
- `S3_BUCKET`: `gentrydemchak-portfolio-site`
- `CLOUDFRONT_DISTRIBUTION_ID`: `E3QAVS6FHUP3ED`

The environment is restricted to deployments from the `main` branch.

## IAM Trust Policy

The deploy role uses this trust policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::901712715767:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:deevolutionism/portfolio:environment:production"
        }
      }
    }
  ]
}
```

## IAM Permissions Policy

The deploy role uses this inline permissions policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::gentrydemchak-portfolio-site"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::gentrydemchak-portfolio-site/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::901712715767:distribution/E3QAVS6FHUP3ED"
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

This distribution uses the private S3 REST origin with Origin Access Control and the rewrite function above.

## DNS Cutover

After testing `https://d51kfvr58otrx.cloudfront.net/`, cut over the apex in Route 53 by replacing the current GitHub Pages record:

```text
A gentrydemchak.com -> 185.199.108.153
```

with an `A` Alias record:

```text
A gentrydemchak.com -> E3QAVS6FHUP3ED / d51kfvr58otrx.cloudfront.net
```

Optionally add:

```text
A www.gentrydemchak.com -> E3QAVS6FHUP3ED / d51kfvr58otrx.cloudfront.net
```
