using System.Net.Http.Headers;
using System.Text.Json;
using GigBoard.Api.DTOs;

namespace GigBoard.Api.Services;

public interface ILinkedInService
{
    Task<LinkedInTokenResponse?> ExchangeCodeForToken(string code, string redirectUri);
    Task<LinkedInUserInfo?> GetUserInfo(string accessToken);
}

public class LinkedInService : ILinkedInService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<LinkedInService> _logger;
    
    public LinkedInService(HttpClient httpClient, IConfiguration config, ILogger<LinkedInService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }
    
    public async Task<LinkedInTokenResponse?> ExchangeCodeForToken(string code, string redirectUri)
    {
        var clientId = _config["LinkedIn:ClientId"];
        var clientSecret = _config["LinkedIn:ClientSecret"];
        
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "authorization_code"),
            new KeyValuePair<string, string>("code", code),
            new KeyValuePair<string, string>("redirect_uri", redirectUri),
            new KeyValuePair<string, string>("client_id", clientId!),
            new KeyValuePair<string, string>("client_secret", clientSecret!)
        });
        
        try
        {
            var response = await _httpClient.PostAsync("https://www.linkedin.com/oauth/v2/accessToken", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("LinkedIn token exchange failed: {Response}", responseContent);
                return null;
            }
            
            return JsonSerializer.Deserialize<LinkedInTokenResponse>(responseContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exchanging LinkedIn code for token");
            return null;
        }
    }
    
    public async Task<LinkedInUserInfo?> GetUserInfo(string accessToken)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            
            var response = await _httpClient.GetAsync("https://api.linkedin.com/v2/userinfo");
            var content = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("LinkedIn userinfo failed: {Response}", content);
                return null;
            }
            
            return JsonSerializer.Deserialize<LinkedInUserInfo>(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting LinkedIn user info");
            return null;
        }
    }
}

