Image AI（一）：Next.js 14 多端身份认证系统实践

> 本文是 Image AI 项目的技术实践分享。Image AI 是一个功能强大的在线图片编辑器,集成了 AI 图片生成、背景移除等功能。项目完全开源,欢迎访问 GitHub 仓库 了解更多细节。

- 在线体验: https://www.imagegicai.com
- GitHub: https://github.com/zhengchchen/image-ai

主要功能:
- 🎨 完整的图片编辑功能
- 🤖 AI 图片生成
- 🎭 智能背景移除
- 📦 模板系统
- 💾 多种导出格式


## 背景介绍

在现代 Web 应用中,一个完善的身份认证系统是不可或缺的。本项目基于 Next.js 14 和 NextAuth.js 实现了一个功能完整的多端身份认证系统,支持:
- 邮箱密码登录
- GitHub OAuth 登录
- Google OAuth 登录
- JWT Session 管理
- 数据库适配器集成

## 技术栈
- Next.js 14    
- NextAuth.js 5.0 Beta
- Drizzle ORM
PostgreSQL
- Zod
- TypeScript

## 系统架构

### 1.核心配置

NextAuth 的核心配置位于 auth.config.ts:

```typescript
export default {
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const validatedFields = CredentialsSchema.safeParse(credentials);
          if (!validatedFields.success) {
            return null;
          }
  
          const { email, password } = validatedFields.data
  
          const query = await db.select().from(users).where(eq(users.email,email))
  
          const user = query[0]
  
          if(!user || !user.password){
              return null
          }
  
          const passwordsMatch = await bcrypt.compare(password, user.password)
  
          if(!passwordsMatch){
            return null
          }
  
          return user
        },
      }),
      Github, 
      Google],
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
    }),
    pages: {
      signIn: "/sign-in",
      error: "/sign-in",
    },
    session: {
      strategy: "jwt",
    },
    callbacks:{
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (token.id) {
          session.user.id = token.id;
        }
        return session;
      },
    },
} satisfies NextAuthConfig;
```
配置主要包含:
- 认证提供者(Providers)
- 数据库适配器(Adapter)
- JWT 策略
- 回调函数(Callbacks)

### 2.数据库集成

使用 Drizzle ORM 作为数据库适配器:

```typescript
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/drizzle";

adapter: DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
}),
```
### 3.认证提供者

#### 3.1.凭证认证(Credentials)

凭证认证是最简单的认证方式，通常用于邮箱密码登录。

```typescript
const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default {
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const validatedFields = CredentialsSchema.safeParse(credentials);
          if (!validatedFields.success) {
            return null;
          }
  
          const { email, password } = validatedFields.data
  
          const query = await db.select().from(users).where(eq(users.email,email))
  
          const user = query[0]
  
          if(!user || !user.password){
              return null
          }
  
          const passwordsMatch = await bcrypt.compare(password, user.password)
  
          if(!passwordsMatch){
            return null
          }
  
          return user
        },
      }),
      Github, 
      Google],
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
    }),
    pages: {
      signIn: "/sign-in",
      error: "/sign-in",
    },
    session: {
      strategy: "jwt",
    },
    callbacks:{
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (token.id) {
          session.user.id = token.id;
        }
        return session;
      },
    },
} satisfies NextAuthConfig;

```
使用 Zod 进行数据验证,bcrypt 进行密码加密。

#### 3.2 OAuth 提供者

支持 GitHub 和 Google OAuth:

```typescript
providers: [
  Credentials({...}),
  Github,
  Google
],
```


### 4.Session 管理

采用 JWT 策略进行会话管理:

```typescript
session: {
  strategy: "jwt",
},
```

通过回调函数扩展 JWT 和 Session:

```typescript
    callbacks:{
      jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      session({ session, token }) {
        if (token.id) {
          session.user.id = token.id;
        }
        return session;
      },
    },

```

## 前端实现

### 1.登录页面

登录组件实现：

```typescript
"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardTitle,
    CardHeader,
    CardContent,
    CardDescription
} from "@/components/ui/card"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSearchParams } from "next/navigation"
import { TriangleAlert } from "lucide-react"


export const SignInCard = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const params = useSearchParams()
    const error = params.get("error")

    const onCredentialsSignin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signIn("credentials", { email, password, redirectTo: "/" });
    }

    const onProviderSignin = (provider:"github" | "google") => {
        signIn(provider,{ redirectTo:"/" })
    }

    return <Card className="w-full h-full p-8">
        <CardHeader className="px-0 pt-0">
            <CardTitle>Login to continue</CardTitle>
            <CardDescription>Use your email or another service to login</CardDescription>
        </CardHeader>
        {
            !!error && <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                <TriangleAlert className="size-4 text-destructive"/>
                <p className="text-sm text-destructive">Invalid email or password</p>
            </div>
        }
        <CardContent className="space-y-5 px-0 pb-0">
            <form onSubmit={onCredentialsSignin} className="space-y-2.5">
                <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button type="submit" className="w-full" size="lg">Continue</Button>
            </form>
            <Separator/>
            <div className="flex flex-col gap-y-2.5">
                <Button onClick={() => onProviderSignin("google")} className="w-full relative" variant="outline" size="lg">
                    <FcGoogle className="absolute mr-2 size-5 top-2.5 left-2.5"/>Continue with Google
                </Button>
                <Button onClick={() => onProviderSignin("github")} className="w-full relative" variant="outline" size="lg">
                    <FaGithub className="absolute mr-2 size-5 top-2.5 left-2.5"/>Continue with Github
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Don&apos;t have an account? <Link href="/sign-up"><span className="text-sky-700 hover:underline">Sign up</span></Link></p>
        </CardContent>
    </Card>
}
```

### 2.路由保护

服务端路由保护:

```typescript
import { protectServer } from "@/features/auth/utils";
import { Banner } from "./banner";
import { ProjectsSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";

export default async function Home() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <TemplatesSection/>
      <ProjectsSection/>
    </div>
  );
}
```

### 3.布局处理

认证页面专用布局:

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-[url(/bg.jpg)] bg-top bg-cover flex flex-col h-full">
      <div className="z-[4] items-center justify-center w-full h-full flex flex-col">
        <div className="w-full h-full md:h-auto md:w-[420px]">{children}</div>
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.8),rgba(0,0,0,0.4),rgba(0,0,0,0.8))] z[1]" />
    </div>
  );
};

export default AuthLayout;
```

## 环境变量

需要配置以下环境变量:

```
# NextAuth
AUTH_SECRET=

# OAuth Providers
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Database
DATABASE_URL=
```

## 最佳实践

1. 类型安全
   - 使用 TypeScript 确保类型安全
   - 使用 Zod 进行运行时验证
2. 安全性
   - 使用 bcrypt 加密密码
   - 实现 JWT 策略
   - OAuth 安全配置
3. 用户体验
   - 多平台登录选择
   - 错误处理和提示
   - 响应式设计
4. 可维护性
   - 模块化的认证配置
   - 清晰的项目结构
   - 完善的类型定义

## 总结

通过 Next.js 14 和 NextAuth.js 的结合,我们实现了一个功能完整、类型安全、可扩展的身份认证系统。系统支持多种认证方式,并通过 Drizzle ORM 实现了数据持久化,为应用提供了可靠的身份认证基础。

## 参考资料

- [NextAuth.js](https://next-auth.js.org/)
- [Next.js 14](https://nextjs.org/)
- [Drizzle ORM](https://drizzle.dev/)
- [Zod](https://zod.dev/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
