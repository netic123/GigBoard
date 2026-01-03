using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

namespace GigBoard.Api.Services;

public interface ILinkedInService
{
    Task<LinkedInTokenResponse?> ExchangeCodeForToken(string code, string redirectUri);
    LinkedInUserInfo? GetUserInfoFromIdToken(string idToken);
    Task<LinkedInUserInfo?> GetUserInfo(string accessToken);
}

public class LinkedInService : ILinkedInService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;
    
    public LinkedInService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClient = httpClientFactory.CreateClient();
    }
    
    public async Task<LinkedInTokenResponse?> ExchangeCodeForToken(string code, string redirectUri)
    {
        var clientId = _config["LinkedIn:ClientId"];
        var clientSecret = _config["LinkedIn:ClientSecret"];
        
        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            return null;
        
        var tokenEndpoint = "https://www.linkedin.com/oauth/v2/accessToken";
        
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = redirectUri,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret
        });
        
        try
        {
            var response = await _httpClient.PostAsync(tokenEndpoint, content);
            if (!response.IsSuccessStatusCode)
                return null;
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LinkedInTokenResponse>(json);
        }
        catch
        {
            return null;
        }
    }
    
    public LinkedInUserInfo? GetUserInfoFromIdToken(string idToken)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(idToken);
            
            return new LinkedInUserInfo
            {
                sub = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "",
                email = token.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? "",
                name = token.Claims.FirstOrDefault(c => c.Type == "name")?.Value ?? "",
                given_name = token.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value,
                family_name = token.Claims.FirstOrDefault(c => c.Type == "family_name")?.Value,
                picture = token.Claims.FirstOrDefault(c => c.Type == "picture")?.Value
            };
        }
        catch
        {
            return null;
        }
    }
    
    public async Task<LinkedInUserInfo?> GetUserInfo(string accessToken)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.linkedin.com/v2/userinfo");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<LinkedInUserInfo>(json);
        }
        catch
        {
            return null;
        }
    }
}

public class LinkedInTokenResponse
{
    public string access_token { get; set; } = "";
    public int expires_in { get; set; }
    public string? id_token { get; set; }
    public string? scope { get; set; }
    public string? token_type { get; set; }
}

public class LinkedInUserInfo
{
    public string sub { get; set; } = "";
    public string email { get; set; } = "";
    public string name { get; set; } = "";
    public string? given_name { get; set; }
    public string? family_name { get; set; }
    public string? picture { get; set; }
}

