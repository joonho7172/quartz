auth  
├── controller  
│ └── AuthController  
│  
├── service  
│ ├── OAuthStateService  
│ ├── OAuthAuthenticationService  
│ ├── TokenReissueService  
│ ├── RefreshTokenService  
│ └── LogoutService  
│  
├── client  
│ ├── OAuthProviderClient  
│ └── KakaoOAuthClient  
│  
├── token  
│ ├── AccessTokenIssuer  
│ └── JwtAccessTokenIssuer  
│  
├── dto  
│ ├── OAuthStateResponse  
│ ├── OAuthLoginRequest  
│ ├── OAuthUserInfo  
│ ├── AuthResponse  
│ └── TokenReissueResponse  
│  
└── state  
├── OAuthStateStore  
└── RedisOAuthStateStore

user  
├── controller  
│ └── UserController  
│  
├── service  
│ ├── AccountProvisioningService  
│ └── AccountWithdrawalService  
│  
├── entity  
│ ├── User  
│ ├── SocialAccount  
│ └── RefreshToken  
│  
└── repository  
├── UserRepository  
├── SocialAccountRepository  
└── RefreshTokenRepository

security  
├── JwtAuthenticationFilter  
├── SecurityConfig  
└── CurrentUser

common  
├── GlobalExceptionHandler  
├── ErrorCode  
└── ApiResponse