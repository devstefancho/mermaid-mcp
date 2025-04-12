## Prompt

```
처음에 /agents 경로로 접속한다. 만약 허용된 ip가 아니라면 Access Denied
페이지가 나온다. 허용된 ip이지만 로그인이 되지 않았다면 okta 로그인 페이지가
나온다. okta 로그인을 하고나면 /agents 페이지로 다시 진입한다. 하지만
로그인정보(userinfo.groups)에 "AGENT_DEVELOPER" role이 없으면, 접근 권한이
없습니다. 페이지가 나온다. role이 있다면, 정상적으로 agent 목록이 있는 화면이
나온다. flowchart

```

## Result
```mermaid
flowchart TD
    A[시작] --> B['/agents 경로 접속']
    B --> C{IP 허용 여부 확인?}
    C -->|아니오| D[Access Denied 페이지 표시]
    D --> E[종료]
    C -->|예| F{로그인 상태 확인?}
    F -->|아니오| G[Okta 로그인 페이지 표시]
    G --> H[Okta 로그인 완료]
    H --> I['/agents 경로로 리다이렉트']
    I --> J[로그인 정보 확인]
    F -->|예| J
    J --> K{userinfo.groups에 AGENT_DEVELOPER role이 있는지 확인?}
    K -->|아니오| L[접근 권한이 없습니다 페이지 표시]
    L --> E
    K -->|예| M[Agent 목록 화면 표시]
    M --> E```
