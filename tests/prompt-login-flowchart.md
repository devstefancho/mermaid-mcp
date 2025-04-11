## Prompt

```
[Flowchart]
처음에 /agents 경로로 접속한다. 만약 허용된 ip가 아니라면 Access Denied
페이지가 나온다. 허용된 ip이지만 로그인이 되지 않았다면 okta 로그인 페이지가
나온다. okta 로그인을 하고나면 /agents 페이지로 다시 진입한다. 하지만
로그인정보(userinfo.groups)에 "AGENT_DEVELOPER" role이 없으면, 접근 권한이
없습니다. 페이지가 나온다. role이 있다면, 정상적으로 agent 목록이 있는 화면이
나온다.

```

## Result
```mermaid
flowchart TD
    A(시작) --> B(/agents 경로 접속)
    B --> C{허용된 IP?}
    C -->|아니오| D(Access Denied 페이지 표시)
    C -->|예| E{로그인 되어있음?}
    E -->|아니오| F(Okta 로그인 페이지로 리다이렉트)
    F --> G(Okta 로그인 완료)
    G --> B
    E -->|예| H{AGENT_DEVELOPER 역할 있음?}
    H -->|아니오| I(접근 권한이 없습니다 페이지 표시)
    H -->|예| J(에이전트 목록 페이지 표시)
    D --> K(종료)
    I --> K
    J --> K
```
