import requests

# Base URL of the API (replace with the actual URL)
BASE_URL = "https://traq.duckdns.org/api/v3/channels"

def get_channels(include_dm=False, path=None):
    """Fetch the list of channels from the API."""
    
    # Define query parameters
    params = {"include-dm": str(include_dm).lower()}
    if path:
        params["path"] = path

    try:
        # Send GET request
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()  # Raise an error for bad responses

        # Parse JSON response
        data = response.json()
        
        # Print formatted JSON response
        print("Public Channels:")
        for channel in data.get("public", []):
            print(f"  - Name: {channel['name']} (ID: {channel['id']})")

        if include_dm:
            print("\nDirect Message Channels:")
            for dm in data.get("dm", []):
                print(f"  - DM ID: {dm['id']} (User ID: {dm['userId']})")
        
        return data  # Return parsed response

    except requests.exceptions.RequestException as e:
        print("Error fetching channels:", e)
        return None

# Example usage
channels_data = get_channels(include_dm=True, path="support")
