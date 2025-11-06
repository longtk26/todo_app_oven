import os
import sys
import json
import boto3
from botocore.exceptions import ClientError


def get_secret(secret_name: str, region_name: str) -> dict:
    """
    Fetch secret from AWS Secrets Manager.
    
    Args:
        secret_name: Name or ARN of the secret
        region_name: AWS region
        
    Returns:
        Dictionary containing secret key-value pairs
    """
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print(f"Error retrieving secret: {e}", file=sys.stderr)
        raise e

    secret = get_secret_value_response['SecretString']
    return json.loads(secret)


def create_env_file(secrets: dict, output_file: str = '.env'):
    """
    Create .env file from secrets dictionary.
    
    Args:
        secrets: Dictionary of environment variables
        output_file: Path to output .env file
    """
    with open(output_file, 'w') as f:
        for key, value in secrets.items():
            # Escape values with spaces or special characters
            if ' ' in str(value) or '"' in str(value):
                value = f'"{value}"'
            f.write(f"{key}={value}\n")
    
    print(f"Environment file created: {output_file}")
    print(f"Loaded {len(secrets)} environment variables")


def main():
    # Get configuration from environment variables
    secret_name = os.environ.get('AWS_SECRETS_NAME')
    region_name = os.environ.get('AWS_REGION', 'ap-southeast-1')
    output_file = os.environ.get('ENV_FILE_PATH', '.env')
    
    if not secret_name:
        print("Error: AWS_SECRETS_NAME environment variable not set", file=sys.stderr)
        sys.exit(1)
    
    print(f"Fetching secrets from: {secret_name}")
    print(f"Region: {region_name}")
    
    try:
        secrets = get_secret(secret_name, region_name)
        create_env_file(secrets, output_file)
        
        print("Created .env file")
            
    except Exception as e:
        print(f"Failed to setup environment: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
