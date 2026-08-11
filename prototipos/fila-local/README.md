# Protótipo da fila local

O único componente que pode invalidar a stack ([D-024](../../DECISOES.md)), por isso testado antes de qualquer tela. Uma página que registra eventos num banco local do navegador (IndexedDB) e sincroniza quando há conexão, contra um endpoint falso que deduplica pelo id gerado no dispositivo.

## Rodar

```bash
python servidor.py
```

Abrir no celular, **na mesma rede wi-fi**, o endereço que o servidor imprime. No iPhone, adicionar à tela de início antes de testar — página solta o Safari pode limpar o armazenamento; instalada, o tratamento é outro.

## O que verificar

- [ ] Registrar com wi-fi ligado: fila esvazia em segundos, evento aparece em `eventos.jsonl`
- [ ] Modo avião, registrar 3 eventos: fila mostra 3, estado "sem conexão"
- [ ] **Fechar o navegador por completo, reabrir: os 3 continuam na fila**
- [ ] Religar o wi-fi: fila esvazia sozinha, sem duplicar nada no `eventos.jsonl`
- [ ] Derrubar só o servidor (Ctrl+C) com wi-fi ligado: página informa e tenta de novo com recuo
- [ ] No iPhone: repetir tudo pela versão da tela de início, e conferir a fila depois de um dia

Se o item em negrito falhar no aparelho real — o navegador limpar a fila —, a stack inteira volta para discussão. Todo o resto é ajuste.

## O que este protótipo não testa

Abrir a página sem conexão nenhuma (exige service worker, que exige https — vem com a hospedagem real). Aqui a página precisa estar aberta, ou ter sido aberta, antes de cair a conexão.
