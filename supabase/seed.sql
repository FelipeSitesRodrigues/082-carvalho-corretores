-- Gerado por scripts/gerar-seed.mjs. Não editar à mão: mudar demo.ts e rodar de novo.
-- Rodar DEPOIS da migration, no SQL Editor do Supabase (ou supabase db reset).

begin;

insert into public.config (chave, valor, publica) values
  ('imobiliaria', '{"nome":"Carvalho Corretores","nomeCompleto":"Carvalho Corretores de Imóveis","whatsapp":"5511900000000","whatsappExibicao":"(11) 90000-0000","creci":"CRECI-SP 00000-J","cidade":"Poá","uf":"SP","regiao":"Alto Tietê","endereco":"Centro, Poá, SP","horarios":[{"dias":"Segunda a sexta","horas":"9h às 18h"},{"dias":"Sábado","horas":"9h às 13h"}],"instagram":null,"facebook":null,"taxaJurosAnual":11,"dadosDeExemplo":true}'::jsonb, true)
on conflict (chave) do update set valor = excluded.valor, publica = excluded.publica;

insert into public.bairros (slug, nome, foto_path, foto_largura, foto_altura, ordem) values
  ('centro', 'Centro', '/img/bairros/bairro-centro-640.webp', 640, 533, 1),
  ('vila-perracini', 'Vila Perracini', '/img/bairros/bairro-vila-perracini-640.webp', 640, 533, 2),
  ('calmon-viana', 'Calmon Viana', '/img/bairros/bairro-calmon-viana-640.webp', 640, 533, 3),
  ('jardim-america', 'Jardim América', '/img/bairros/bairro-jardim-america-640.webp', 640, 533, 4),
  ('vila-amelia', 'Vila Amélia', '/img/bairros/bairro-vila-amelia-640.webp', 640, 533, 5),
  ('vila-julia', 'Vila Júlia', '/img/bairros/bairro-vila-julia-640.webp', 640, 533, 6)
on conflict (slug) do update set nome = excluded.nome, foto_path = excluded.foto_path, ordem = excluded.ordem;

-- CC-0101 · Apartamento no Centro
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '5c1c6234-1794-48bd-816e-b74e8d162052', 'apartamento-2-quartos-centro-poa', 'CC-0101', 'publicado', true, 0, 'venda', 'apartamento', 'Apartamento no Centro',
  'centro', 'Poá', 'SP', 32000000, null, null,
  56, 2, 0, 1, 1, 'Apartamento de 56 m² no Centro de Poá, com dois quartos, sala integrada à cozinha e uma vaga de garagem. Perto do comércio, da estação e dos serviços do centro, para quem quer resolver tudo a pé.', array['Sala integrada à cozinha', 'Quartos com janela ampla', 'Área de serviço', 'Portaria']::text[],
  true, true, false, '2026-10-04'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('5c1c6234-1794-48bd-816e-b74e8d162052', '/img/imoveis/01-apto-centro-1-1600.webp', 0, 1600, 1066, 'Quarto de casal claro com cama arrumada, tons bege e janelas amplas com vista da cidade'),
  ('5c1c6234-1794-48bd-816e-b74e8d162052', '/img/imoveis/01-apto-centro-2-1600.webp', 1, 1600, 1066, 'Sala de estar com sofá cinza, poltrona e janelas amplas'),
  ('5c1c6234-1794-48bd-816e-b74e8d162052', '/img/imoveis/01-apto-centro-3-1600.webp', 2, 1600, 1066, 'Cozinha com armários de madeira e bancada escura, integrada à sala'),
  ('5c1c6234-1794-48bd-816e-b74e8d162052', '/img/imoveis/01-apto-centro-4-1600.webp', 3, 1600, 1066, 'Banheiro com bancada de mármore bege e gabinete de madeira');

-- CC-0102 · Apartamento na Vila Perracini
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '764655e7-f7d5-4aec-991a-ac566da3b687', 'apartamento-2-quartos-aluguel-vila-perracini-poa', 'CC-0102', 'publicado', true, 1, 'aluguel', 'apartamento', 'Apartamento na Vila Perracini',
  'vila-perracini', 'Poá', 'SP', 150000, null, null,
  48, 2, 0, 1, 1, 'Apartamento de 48 m² para alugar na Vila Perracini, com dois quartos, cozinha integrada e uma vaga. Bairro residencial, tranquilo e perto do centro de Poá.', array['Cozinha integrada', 'Varanda', 'Área de serviço', 'Bicicletário']::text[],
  false, false, false, '2026-10-03'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('764655e7-f7d5-4aec-991a-ac566da3b687', '/img/imoveis/02-apto-vila-perracini-1-1600.webp', 0, 1600, 1066, 'Cozinha integrada com armários brancos e mesa redonda pequena'),
  ('764655e7-f7d5-4aec-991a-ac566da3b687', '/img/imoveis/02-apto-vila-perracini-2-1600.webp', 1, 1600, 1066, 'Sala de estar com sofá escuro, mesa de centro e parede verde-clara'),
  ('764655e7-f7d5-4aec-991a-ac566da3b687', '/img/imoveis/02-apto-vila-perracini-3-1600.webp', 2, 1600, 1066, 'Quarto com cama de casal, roupa de cama clara e armário espelhado'),
  ('764655e7-f7d5-4aec-991a-ac566da3b687', '/img/imoveis/02-apto-vila-perracini-4-1600.webp', 3, 1600, 1066, 'Varanda pequena com mesa, duas cadeiras e vasos de plantas');

-- CC-0103 · Casa no Calmon Viana
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '3780ca3a-ac8a-4db4-acd5-8a7bb48135c5', 'casa-3-quartos-calmon-viana-poa', 'CC-0103', 'publicado', true, 2, 'venda', 'casa', 'Casa no Calmon Viana',
  'calmon-viana', 'Poá', 'SP', 45000000, null, null,
  125, 3, 1, 2, 2, 'Casa térrea de 125 m² no Calmon Viana, com três quartos (um suíte), duas vagas e quintal. A poucos minutos da estação Calmon Viana, que liga Poá a São Paulo pelas linhas 11 e 12 da CPTM.', array['Suíte', 'Quintal', 'Garagem para 2 carros', 'Cozinha planejada']::text[],
  true, true, false, '2026-10-02'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('3780ca3a-ac8a-4db4-acd5-8a7bb48135c5', '/img/imoveis/03-casa-calmon-viana-1-1600.webp', 0, 1600, 1066, 'Fachada de casa térrea moderna com garagem e gramado na frente'),
  ('3780ca3a-ac8a-4db4-acd5-8a7bb48135c5', '/img/imoveis/03-casa-calmon-viana-2-1600.webp', 1, 1600, 1066, 'Sala de estar com sofá, tapete e janela'),
  ('3780ca3a-ac8a-4db4-acd5-8a7bb48135c5', '/img/imoveis/03-casa-calmon-viana-3-1600.webp', 2, 1600, 1066, 'Cozinha branca com bancada de madeira e eletrodomésticos de inox'),
  ('3780ca3a-ac8a-4db4-acd5-8a7bb48135c5', '/img/imoveis/03-casa-calmon-viana-4-1600.webp', 3, 1600, 1066, 'Quarto de casal com paredes brancas e janela');

-- CC-0104 · Apartamento na Vila Júlia
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '666cb2ec-5460-4bc4-88e1-9129f3c74140', 'apartamento-2-quartos-aluguel-vila-julia-poa', 'CC-0104', 'publicado', true, 3, 'aluguel', 'apartamento', 'Apartamento na Vila Júlia',
  'vila-julia', 'Poá', 'SP', 130000, null, null,
  52, 2, 0, 1, 1, 'Apartamento de 52 m² para alugar na Vila Júlia, com sala integrada, dois quartos e uma vaga. Prédio em rua residencial, com luz natural o dia todo.', array['Sala integrada', 'Janelas amplas', 'Área de serviço', 'Portão eletrônico']::text[],
  false, false, false, '2026-10-01'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('666cb2ec-5460-4bc4-88e1-9129f3c74140', '/img/imoveis/04-apto-vila-julia-1-1600.webp', 0, 1600, 1066, 'Sala de estar com sofá, poltronas e janela ampla com luz natural'),
  ('666cb2ec-5460-4bc4-88e1-9129f3c74140', '/img/imoveis/04-apto-vila-julia-2-1600.webp', 1, 1600, 1066, 'Quarto de casal com cabeceira estofada e janela grande'),
  ('666cb2ec-5460-4bc4-88e1-9129f3c74140', '/img/imoveis/04-apto-vila-julia-3-1600.webp', 2, 1600, 1066, 'Cozinha branca integrada com mesa de jantar de madeira'),
  ('666cb2ec-5460-4bc4-88e1-9129f3c74140', '/img/imoveis/04-apto-vila-julia-4-1600.webp', 3, 1600, 1066, 'Banheiro branco com banheira, vaso e gabinete');

-- CC-0105 · Apartamento com varanda gourmet no Centro
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '4eb45a77-16f2-4a91-ba52-eec54fb02f9e', 'apartamento-3-quartos-varanda-gourmet-centro-poa', 'CC-0105', 'publicado', false, 4, 'venda', 'apartamento', 'Apartamento com varanda gourmet no Centro',
  'centro', 'Poá', 'SP', 62000000, 69000, null,
  78, 3, 1, 2, 2, 'Apartamento de 78 m² no Centro de Poá, com três quartos (um suíte), varanda gourmet integrada à sala e duas vagas. Condomínio com lazer.', array['Varanda gourmet', 'Suíte', 'Lazer no condomínio', 'Portaria 24 horas']::text[],
  true, true, false, '2026-09-28'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('4eb45a77-16f2-4a91-ba52-eec54fb02f9e', '/img/imoveis/05-apto-centro-varanda-1-1600.webp', 0, 1600, 1066, 'Varanda com churrasqueira, conjunto de estofados e vista para a cidade'),
  ('4eb45a77-16f2-4a91-ba52-eec54fb02f9e', '/img/imoveis/05-apto-centro-varanda-2-1600.webp', 1, 1600, 1066, 'Sala de estar com sofá branco, TV e janela com vista para árvores'),
  ('4eb45a77-16f2-4a91-ba52-eec54fb02f9e', '/img/imoveis/05-apto-centro-varanda-3-1600.webp', 2, 1600, 1066, 'Suíte com cama de casal, escrivaninha e piso de madeira'),
  ('4eb45a77-16f2-4a91-ba52-eec54fb02f9e', '/img/imoveis/05-apto-centro-varanda-4-1600.webp', 3, 1600, 1066, 'Cozinha branca com ilha central e janelas amplas');

-- CC-0106 · Apartamento no Jardim América
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  'f1ecc833-3256-4598-8e51-43bac83e3033', 'apartamento-2-quartos-aluguel-jardim-america-poa', 'CC-0106', 'publicado', false, 5, 'aluguel', 'apartamento', 'Apartamento no Jardim América',
  'jardim-america', 'Poá', 'SP', 155000, 15000, null,
  50, 2, 0, 1, 1, 'Apartamento de 50 m² para alugar no Jardim América, com cozinha americana planejada, dois quartos e uma vaga. Condomínio baixo.', array['Cozinha americana planejada', 'Condomínio baixo', 'Área de serviço']::text[],
  false, false, false, '2026-09-27'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('f1ecc833-3256-4598-8e51-43bac83e3033', '/img/imoveis/06-apto-jardim-america-1-1600.webp', 0, 1600, 1066, 'Cozinha planejada branca com armários de madeira clara'),
  ('f1ecc833-3256-4598-8e51-43bac83e3033', '/img/imoveis/06-apto-jardim-america-2-1600.webp', 1, 1600, 1066, 'Sala de estar com sofá claro, mesa de centro de madeira e janela'),
  ('f1ecc833-3256-4598-8e51-43bac83e3033', '/img/imoveis/06-apto-jardim-america-3-1600.webp', 2, 1600, 1066, 'Quarto com cama de casal e parede azul-clara'),
  ('f1ecc833-3256-4598-8e51-43bac83e3033', '/img/imoveis/06-apto-jardim-america-4-1600.webp', 3, 1600, 1066, 'Banheiro com banheira, pia sobre gabinete branco e revestimento claro');

-- CC-0107 · Apartamento na Vila Amélia
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '30a4af3c-a243-4f9a-8e37-fde72feec9d6', 'apartamento-2-quartos-aluguel-vila-amelia-poa', 'CC-0107', 'publicado', false, 6, 'aluguel', 'apartamento', 'Apartamento na Vila Amélia',
  'vila-amelia', 'Poá', 'SP', 125000, 25000, null,
  48, 2, 0, 1, 1, 'Apartamento de 48 m² para alugar na Vila Amélia, com dois quartos claros, sala, cozinha e uma vaga.', array['Quartos claros', 'Área de serviço', 'Portão eletrônico']::text[],
  false, false, false, '2026-09-26'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('30a4af3c-a243-4f9a-8e37-fde72feec9d6', '/img/imoveis/07-apto-vila-amelia-1-1600.webp', 0, 1600, 1066, 'Quarto de casal claro com janela grande e planta'),
  ('30a4af3c-a243-4f9a-8e37-fde72feec9d6', '/img/imoveis/07-apto-vila-amelia-2-1600.webp', 1, 1600, 1066, 'Sala de jantar com mesa redonda, cadeiras e janela'),
  ('30a4af3c-a243-4f9a-8e37-fde72feec9d6', '/img/imoveis/07-apto-vila-amelia-3-1600.webp', 2, 1600, 1066, 'Cozinha com armários de madeira clara, ilha e banquetas'),
  ('30a4af3c-a243-4f9a-8e37-fde72feec9d6', '/img/imoveis/07-apto-vila-amelia-4-1600.webp', 3, 1600, 1066, 'Banheiro com banheira, vaso e gabinete de madeira clara');

-- CC-0108 · Apartamento perto da estação Calmon Viana
insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,
  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (
  '48f88158-7651-4d92-bcfd-4e3f97b38c4c', 'apartamento-2-quartos-calmon-viana-perto-da-estacao', 'CC-0108', 'publicado', false, 7, 'venda', 'apartamento', 'Apartamento perto da estação Calmon Viana',
  'calmon-viana', 'Poá', 'SP', 29500000, 33000, null,
  50, 2, 0, 1, 1, 'Apartamento de 50 m² no Calmon Viana, em prédio baixo e arborizado, com dois quartos e uma vaga. A estação Calmon Viana fica a poucos minutos.', array['Perto da estação', 'Prédio baixo', 'Aceita FGTS']::text[],
  true, true, false, '2026-09-25'
) on conflict (slug) do nothing;
insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values
  ('48f88158-7651-4d92-bcfd-4e3f97b38c4c', '/img/imoveis/08-apto-calmon-viana-1-1600.webp', 0, 1600, 1066, 'Fachada de prédio residencial de tijolinho com varandas e árvores'),
  ('48f88158-7651-4d92-bcfd-4e3f97b38c4c', '/img/imoveis/08-apto-calmon-viana-2-1600.webp', 1, 1600, 1066, 'Sala de estar com parede verde-clara, sofá e mesa de jantar ao fundo'),
  ('48f88158-7651-4d92-bcfd-4e3f97b38c4c', '/img/imoveis/08-apto-calmon-viana-3-1600.webp', 2, 1600, 1066, 'Quarto com cama de casal, roupa de cama branca e parede verde-clara'),
  ('48f88158-7651-4d92-bcfd-4e3f97b38c4c', '/img/imoveis/08-apto-calmon-viana-4-1600.webp', 3, 1600, 1066, 'Cozinha branca planejada com janela e parede verde-clara');

select setval('public.imovel_codigo_seq', 108);

commit;
