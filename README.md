# Painel Logístico – Cia C/2º Gpt E

App Next.js para controle operacional e orçamentário com MongoDB Atlas, Vercel, autenticação por e-mail/senha e aprovação manual de usuários.

## Rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie `.env` a partir de `.env.example` e configure `MONGODB_URI`, `AUTH_SECRET` e `NEXTAUTH_URL`.

3. Suba o app:

```bash
npm run dev
```

4. Cadastre o primeiro usuário pela tela de registro. Ele será criado como `role=viewer` e `status=pending`.

5. Promova esse primeiro usuário manualmente no MongoDB Atlas:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  {
    $set: {
      role: "admin",
      status: "approved",
      approvedAt: new Date()
    }
  }
)
```

## Módulos

- Orçamento: Empenhos, RP, Notas de Crédito e Fornecedores.
- Operacional: Viaturas e Equipamentos, Pessoal, Necessidades/Reformas, Documentação e Atividades.
- Administração: Aprovações de usuários.

Usuários cadastrados entram como pendentes e só acessam dados depois da aprovação de um admin. O primeiro admin é destravado manualmente no banco.
