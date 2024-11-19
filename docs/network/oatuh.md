# OAuth 2.0

OAuth 是一个有关授权的网络开放标准，用来授权服务，获取用户数据，目前版本为 2.0。OAuth 2.0 的标准是 [RFC 6749](https://tools.ietf.org/html/rfc6749) 文件。

## 名词定义

- Third-party application：第三方应用程序，即客户端 client
- HTTP service：Http 服务器提供商
- Resource Owner：资源所有者，即用户 user
- User Agent：用户代理，即浏览器
- Authorization server：认证服务器，服务提供商专门处理认证的服务器
- Resource server：资源服务器，服务提供商存放用户生成的资源的服务器

## 思路

OAuth 在客户端与服务端之间架起了一个授权层（authorization layer）。客户端不能直接登录服务端，只能登录授权层，以此将用户与客户端分开。登录授权层使用的令牌（token），与密码不同，可以指定权限范围和有效期。

## 运行流程

![](https://cdn.nlark.com/yuque/0/2024/png/40368468/1704336108490-ea1da24c-903f-4f9f-9e08-04ea0bc57b3d.png)

（A）用户打开客户端以后，客户端要求用户给予授权。

（B）用户同意给予客户端授权。

（C）客户端使用上一步获得的授权，向认证服务器申请令牌。

（D）认证服务器对客户端进行认证以后，确认无误，同意发放令牌。

（E）客户端使用令牌，向资源服务器申请获取资源。

（F）资源服务器确认令牌无误，同意向客户端开放资源。

## 授权模式

上面的流程中，OAuth 的核心是向第三方应用颁发令牌。OAuth 规定了四种获得令牌的流程。

### 授权码

第三方应用先申请一个授权吗，然后利用该授权码获取令牌。

1. A 网站提供链接，用户点击跳转到 B 网站，授权用户数据给 A 网站。

```typescript
https://b.com/oauth/authorize?
  response_type=code&
  client_id=CLIENT_ID&
  redirect_uri=CALLBACK_URL&
  scope=read
```

上面 URL 中，response_type 参数表示要求返回授权码（code），client_id 参数让 B 知道是谁在请求，redirect_uri 参数是 B 接受或拒绝请求后的跳转网址，scope 参数表示要求的授权范围（这里是只读）

2. 用户跳转，用户登录 B 网站，然后 B 网站询问是否同意授权给 A 网站，用户同意，B 站带着授权码 code 跳回 redirect_url。

```typescript
https://a.com/callback?code=AUTHORIZATION_CODE
```

3. A 网站利用授权码向 B 网站请求令牌。

```typescript
https://b.com/oauth/token?
 client_id=CLIENT_ID&
 client_secret=CLIENT_SECRET&
 grant_type=authorization_code&
 code=AUTHORIZATION_CODE&
 redirect_uri=CALLBACK_URL
```

上面 URL 中，client_id 参数和 client_secret 参数用来让 B 确认 A 的身份（client_secret 参数是保密的，因此只能在后端发请求），grant_type 参数的值是 AUTHORIZATION_CODE，表示采用的授权方式是授权码，code 参数是上一步拿到的授权码，redirect_uri 参数是令牌颁发后的回调网址。

4. B 网站颁发令牌，即向 redirect_url 发送一段 JSON 数据

```typescript
{
  "access_token":"ACCESS_TOKEN",
  "token_type":"bearer",
  "expires_in":2592000,
  "refresh_token":"REFRESH_TOKEN",
  "scope":"read",
  "uid":100101,
  "info":{...}
}
```

### 隐藏式

针对纯前端应用，没有后端，允许直接向前端颁发令牌，没有授权码这个步骤，所以称为（授权码）隐藏式（impact）。

1. A 网站提供一个链接，要求用户跳转到 B 网站，授权用户数据给 A 网站使用。

```typescript
https://b.com/oauth/authorize?
  response_type=token&
  client_id=CLIENT_ID&
  redirect_uri=CALLBACK_URL&
  scope=read
```

response_type 参数为 token，表示要求直接返回令牌。

2. 用户跳转到 B 网站，登录后同意给予 A 网站授权。这时，B 网站就会跳回 redirect_uri 参数指定的跳转网址，并且把令牌作为 URL 参数，传给 A 网站。

```typescript
https://a.com/callback#token=ACCESS_TOKEN
```

token 参数就是令牌，A 网站因此直接在前端拿到令牌。

**notice：令牌的位置是 URL 锚点（fragment），而不是查询字符串（querystring），这是因为 OAuth 2.0 允许跳转网址是 HTTP 协议，因此存在"中间人攻击"的风险，而浏览器跳转时，锚点不会发到服务器，就减少了泄漏令牌的风险。这种方式把令牌直接传给前端，是很不安全的。因此，只能用于一些安全要求不高的场景，并且令牌的有效期必须非常短，通常就是会话期间（session）有效，浏览器关掉，令牌就失效了。**

### 密码式

如果高度信任某个应用，RFC 6749 允许将用户名和密码告诉第三方应用，应用使用密码申请授权。

1. A 网站要求用户提供 B 网站的用户名和密码。拿到以后，A 就直接向 B 请求令牌。

```typescript
https://oauth.b.com/token?
  grant_type=password&
  username=USERNAME&
  password=PASSWORD&
  client_id=CLIENT_ID
```

上面 URL 中，grant_type 参数是授权方式，这里的 password 表示"密码式"，username 和 password 是 B 的用户名和密码。

2. B 网站验证身份通过后，直接给出令牌。注意，这时不需要跳转，而是把令牌放在 JSON 数据里面，作为 HTTP 回应，A 因此拿到令牌。

**这种方式需要用户给出自己的用户名/密码，显然风险很大，因此只适用于其他授权方式都无法采用的情况，而且必须是用户高度信任的应用。**

### 凭证式

适用于没有前端的命令行应用，即在命令行下请求令牌。

1. A 应用在命令行向 B 发出请求。

```typescript
https://oauth.b.com/token?
  grant_type=client_credentials&
  client_id=CLIENT_ID&
  client_secret=CLIENT_SECRET
```

上面 URL 中，grant_type 参数等于`client_credentials`表示采用凭证式，client_id 和 client_secret 用来让 B 确认 A 的身份。

2. B 网站验证通过以后，直接返回令牌。

这种方式给出的令牌，是针对第三方应用的，而不是针对用户的，即有可能多个用户共享同一个令牌。

## 令牌的使用

A 网站拿到令牌，就可以向 B 网站的 API 请求数据。此时，每个发到 API 的请求，都必须带有令牌。具体做法是在请求的头信息，加上一个`Authorization`字段，令牌就放在这个字段里面。

## 更新令牌

B 网站颁发令牌的时候，一次性颁发两个令牌，一个用于获取数据，另一个用于获取新的令牌（refresh token 字段）。

```typescript
https://b.com/oauth/token?
  grant_type=refresh_token&
  client_id=CLIENT_ID&
  client_secret=CLIENT_SECRET&
  refresh_token=REFRESH_TOKEN
```

上面 URL 中，grant_type 参数为 refresh_token 表示要求更新令牌，client_id 参数和 client_secret 参数用于确认身份，refresh_token 参数就是用于更新令牌的令牌。

## 参考文献

- [OAuth 2.0 的一个简单解释](https://www.ruanyifeng.com/blog/2019/04/oauth_design.html)
- [理解 OAuth 2.0](https://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html)
