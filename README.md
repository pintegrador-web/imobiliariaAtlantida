# 🏠 Atlântida Imóveis

Aplicação web moderna para gestão imobiliária, com site público para clientes e painel administrativo completo.

## ✨ Funcionalidades

### Site Público
- Listagem de imóveis disponíveis com filtros por tipo
- Agendamento de visitas com slots configuráveis
- Solicitação de visitas especiais (fora do horário)
- Bloqueio automático de horários ocupados

### Área Restrita (Admin)
- Dashboard com métricas (taxa de ocupação, receita, visitas pendentes)
- **CRUD completo de imóveis** (criar, editar, remover)
- Gestão de visitas (aprovar / rejeitar / excluir)
- Deteção automática de conflitos de horário
- Configuração de regras de visita (dias, horários, bloqueios)

## 🛠️ Stack

- **React 18** + **Vite**
- **Tailwind CSS**
- **Firebase** (Auth + Firestore)
- **localStorage** para fallback offline

## 🚀 Como correr localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/O-TEU-USER/atlantida-imoveis.git
cd atlantida-imoveis
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Depois edita o `.env` com as tuas credenciais do Firebase.

### 4. Correr em desenvolvimento
```bash
npm run dev
```

### 5. Build de produção
```bash
npm run build
npm run preview
```

## 🔥 Configuração do Firebase

### Ativar Authentication
1. Firebase Console → **Authentication** → **Sign-in method**
2. Ativa **Anónimo**

### Regras do Firestore
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Criar coleção
No Firestore, cria a coleção `properties` (pode estar vazia).

## 📁 Estrutura

```
src/
├── components/
│   ├── admin/         # Painel administrativo
│   ├── public/        # Site público
│   ├── common/        # Componentes partilhados
│   └── icons/         # Ícones SVG
├── firebase/          # Configuração Firebase
├── utils/             # Helpers (datas, storage, agenda)
├── constants/         # Constantes globais
├── data/              # Dados mockados
└── App.jsx
```

## 📄 Licença

MIT