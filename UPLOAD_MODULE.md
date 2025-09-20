# Módulo de Upload - Documentação

## Estrutura do Módulo

```
src/app/upload/
├── upload.module.ts           # Módulo principal
├── upload.controller.ts       # Controller com endpoint POST /api/upload/avatar
├── upload.service.ts          # Service com lógica de upload para Cloudflare R2
├── upload.controller.spec.ts  # Testes do controller
├── dto/
│   └── upload-avatar.dto.ts   # DTO para validação
├── interfaces/
│   └── upload.interface.ts    # Interfaces TypeScript
├── pipes/
│   └── file-validation.pipe.ts # Pipe para validação de arquivos
└── providers/
    └── cloudflare.provider.ts  # Provider para configuração do cliente R2
```

## Funcionalidades Implementadas

### ✅ Endpoint de Upload

- **POST** `/api/upload/avatar`
- Aceita FormData com campo `avatar`
- Retorna URL pública do arquivo e mensagem de sucesso

### ✅ Validações

- Tipos de arquivo permitidos: JPEG, PNG, WebP
- Tamanho máximo: 2MB
- Validação via pipe customizado

### ✅ Integração Cloudflare R2

- Upload direto para Cloudflare R2 usando AWS SDK
- Geração de nomes únicos de arquivo com UUID
- Organização em pasta `avatars/`

### ✅ Configuração

- Variáveis de ambiente documentadas
- Provider customizado para cliente R2
- Tratamento de erros

## Variáveis de Ambiente Necessárias

```env
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_BUCKET=your_bucket_name
CLOUDFLARE_PUBLIC_URL=https://your-bucket.your-account-id.r2.cloudflarestorage.com
```

## Exemplo de Uso

### Request

```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -F "avatar=@/path/to/image.jpg"
```

### Response

```json
{
  "url": "https://your-bucket.your-account-id.r2.cloudflarestorage.com/avatars/uuid-generated-name.jpg",
  "message": "Avatar uploaded successfully"
}
```

## Dependências Adicionadas

- `@aws-sdk/client-s3`: Cliente S3 compatível com Cloudflare R2
- `@aws-sdk/s3-request-presigner`: Para assinatura de requests
- `uuid`: Geração de IDs únicos
- `@types/uuid`: Types para UUID (dev dependency)

## Testes

- **Cobertura completa**: 21 testes passando
- **UploadController**: Testes de endpoint e integração com service
- **UploadService**: Testes de upload, configuração e tratamento de erros
- **FileValidationPipe**: Testes de validação de tipo, tamanho e edge cases

### Executar Testes

```bash
# Todos os testes do módulo upload
npm test -- --testPathPattern=upload

# Testes específicos
npm test -- upload.controller.spec.ts
npm test -- upload.service.spec.ts
npm test -- file-validation.pipe.spec.ts
```

### Cobertura de Testes

#### UploadController (2 testes)

- ✅ Definição do controller
- ✅ Upload de avatar com mock do service

#### UploadService (7 testes)

- ✅ Definição do service
- ✅ Upload bem-sucedido com retorno de URL
- ✅ Erro quando configuração do bucket está ausente
- ✅ Erro quando URL pública está ausente
- ✅ Tratamento de erro do cliente R2
- ✅ Tratamento de erros desconhecidos
- ✅ Geração correta de caminho com extensão

#### FileValidationPipe (12 testes)

- ✅ Definição do pipe
- ✅ Aceitação de arquivos JPEG válidos
- ✅ Aceitação de arquivos PNG válidos
- ✅ Aceitação de arquivos WebP válidos
- ✅ Aceitação de arquivo no limite máximo (2MB)
- ✅ Rejeição quando nenhum arquivo é enviado
- ✅ Rejeição quando arquivo é undefined
- ✅ Rejeição de tipo inválido (PDF)
- ✅ Rejeição de tipo inválido (GIF)
- ✅ Rejeição de arquivo acima de 2MB
- ✅ Rejeição de arquivo ligeiramente acima de 2MB
- ✅ Tratamento de arquivo muito pequeno válido
