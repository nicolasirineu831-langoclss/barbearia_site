/**
 * BarberDB — Banco de dados local completo para o SiteBarber
 * Todos os dados são persistidos no localStorage do navegador.
 */

const BarberDB = (() => {

  /* ─────────────────────────────────────────
     SCHEMA / ESTRUTURA INICIAL
  ───────────────────────────────────────── */
  const SCHEMA = {
    clientes: [],       // cadastros de clientes
    barbeiros: [],      // profissionais cadastrados
    servicos: [],       // tipos de serviços oferecidos
    agendamentos: [],   // agendamentos realizados
    avaliacoes: [],     // avaliações / feedback
    config: {}          // configurações gerais da barbearia
  };

  /* ─────────────────────────────────────────
     UTILITÁRIOS INTERNOS
  ───────────────────────────────────────── */
  const _genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const _now   = () => new Date().toISOString();

  function _load() {
    try {
      const raw = localStorage.getItem('barberDB');
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SCHEMA));
    } catch { return JSON.parse(JSON.stringify(SCHEMA)); }
  }

  function _save(db) {
    localStorage.setItem('barberDB', JSON.stringify(db));
  }

  /* seed de dados iniciais se o banco estiver vazio */
  function _seed() {
    const db = _load();

    if (db.servicos.length === 0) {
      const servicos = [
        { id: _genId(), nome: 'Corte Masculino',      preco: 35.00, duracao: 30, ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Barba',                preco: 25.00, duracao: 20, ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Corte + Barba',        preco: 55.00, duracao: 50, ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Hidratação Capilar',   preco: 40.00, duracao: 40, ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Pigmentação de Barba', preco: 50.00, duracao: 45, ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Sobrancelha',          preco: 15.00, duracao: 15, ativo: true, criadoEm: _now() },
      ];
      db.servicos = servicos;
    }

    if (db.barbeiros.length === 0) {
      db.barbeiros = [
        { id: _genId(), nome: 'Carlos Silva',   especialidade: 'Cortes Clássicos', foto: '', ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Rafael Mendes',  especialidade: 'Barba & Degradê',  foto: '', ativo: true, criadoEm: _now() },
        { id: _genId(), nome: 'Diego Rocha',    especialidade: 'Coloração & Skin', foto: '', ativo: true, criadoEm: _now() },
      ];
    }

    if (!db.config || !db.config.nome) {
      db.config = {
        nome:        'BarberShop Premium',
        telefone:    '(11) 99999-9999',
        endereco:    'Rua das Tesouras, 42 — São Paulo/SP',
        horarioAbre: '09:00',
        horarioFecha:'20:00',
        diasFuncionamento: ['seg','ter','qua','qui','sex','sab'],
        intervaloAgendamento: 30, // minutos
        atualizadoEm: _now()
      };
    }

    _save(db);
  }

  /* ─────────────────────────────────────────
     API PÚBLICA
  ───────────────────────────────────────── */

  /* ── CLIENTES ── */
  const Clientes = {
    listar() {
      return _load().clientes;
    },

    buscar(id) {
      return _load().clientes.find(c => c.id === id) || null;
    },

    buscarPorEmail(email) {
      return _load().clientes.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
    },

    cadastrar({ nome, email, telefone, dataNascimento = '', senha = '' }) {
      if (!nome || !email || !telefone) throw new Error('Campos obrigatórios: nome, email, telefone.');
      const db = _load();
      if (db.clientes.find(c => c.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('E-mail já cadastrado.');
      }
      const cliente = {
        id: _genId(),
        nome,
        email,
        telefone,
        dataNascimento,
        senha, // em produção use hash; aqui é ilustrativo
        ativo: true,
        criadoEm: _now(),
        atualizadoEm: _now()
      };
      db.clientes.push(cliente);
      _save(db);
      return cliente;
    },

    atualizar(id, dados) {
      const db = _load();
      const idx = db.clientes.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Cliente não encontrado.');
      db.clientes[idx] = { ...db.clientes[idx], ...dados, atualizadoEm: _now() };
      _save(db);
      return db.clientes[idx];
    },

    excluir(id) {
      const db = _load();
      db.clientes = db.clientes.filter(c => c.id !== id);
      _save(db);
      return true;
    },

    login(email, senha) {
      const cliente = this.buscarPorEmail(email);
      if (!cliente || cliente.senha !== senha) throw new Error('E-mail ou senha inválidos.');
      return cliente;
    }
  };

  /* ── BARBEIROS ── */
  const Barbeiros = {
    listar(apenasAtivos = true) {
      const db = _load();
      return apenasAtivos ? db.barbeiros.filter(b => b.ativo) : db.barbeiros;
    },

    buscar(id) {
      return _load().barbeiros.find(b => b.id === id) || null;
    },

    cadastrar({ nome, especialidade = '', foto = '' }) {
      if (!nome) throw new Error('Nome do barbeiro é obrigatório.');
      const db = _load();
      const barbeiro = { id: _genId(), nome, especialidade, foto, ativo: true, criadoEm: _now(), atualizadoEm: _now() };
      db.barbeiros.push(barbeiro);
      _save(db);
      return barbeiro;
    },

    atualizar(id, dados) {
      const db = _load();
      const idx = db.barbeiros.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Barbeiro não encontrado.');
      db.barbeiros[idx] = { ...db.barbeiros[idx], ...dados, atualizadoEm: _now() };
      _save(db);
      return db.barbeiros[idx];
    },

    excluir(id) {
      const db = _load();
      db.barbeiros = db.barbeiros.filter(b => b.id !== id);
      _save(db);
      return true;
    }
  };

  /* ── SERVIÇOS ── */
  const Servicos = {
    listar(apenasAtivos = true) {
      const db = _load();
      return apenasAtivos ? db.servicos.filter(s => s.ativo) : db.servicos;
    },

    buscar(id) {
      return _load().servicos.find(s => s.id === id) || null;
    },

    cadastrar({ nome, preco, duracao }) {
      if (!nome || !preco || !duracao) throw new Error('Campos obrigatórios: nome, preco, duracao.');
      const db = _load();
      const servico = { id: _genId(), nome, preco: parseFloat(preco), duracao: parseInt(duracao), ativo: true, criadoEm: _now(), atualizadoEm: _now() };
      db.servicos.push(servico);
      _save(db);
      return servico;
    },

    atualizar(id, dados) {
      const db = _load();
      const idx = db.servicos.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Serviço não encontrado.');
      db.servicos[idx] = { ...db.servicos[idx], ...dados, atualizadoEm: _now() };
      _save(db);
      return db.servicos[idx];
    },

    excluir(id) {
      const db = _load();
      db.servicos = db.servicos.filter(s => s.id !== id);
      _save(db);
      return true;
    }
  };

  /* ── AGENDAMENTOS ── */
  const Agendamentos = {
    listar() {
      return _load().agendamentos;
    },

    listarPorCliente(clienteId) {
      return _load().agendamentos.filter(a => a.clienteId === clienteId);
    },

    listarPorData(data) {
      // data: 'YYYY-MM-DD'
      return _load().agendamentos.filter(a => a.data === data);
    },

    listarPorBarbeiro(barbeiroId, data = null) {
      const db = _load();
      return db.agendamentos.filter(a =>
        a.barbeiroId === barbeiroId && (!data || a.data === data)
      );
    },

    buscar(id) {
      return _load().agendamentos.find(a => a.id === id) || null;
    },

    /**
     * Cria um agendamento.
     * @param {object} dados - { clienteId, barbeiroId, servicoId, data, hora, observacoes }
     */
    agendar({ clienteId, barbeiroId, servicoId, data, hora, observacoes = '' }) {
      if (!clienteId || !barbeiroId || !servicoId || !data || !hora) {
        throw new Error('Campos obrigatórios: clienteId, barbeiroId, servicoId, data, hora.');
      }
      const db = _load();

      // verifica conflito de horário com o barbeiro
      const conflito = db.agendamentos.find(a =>
        a.barbeiroId === barbeiroId &&
        a.data === data &&
        a.hora === hora &&
        a.status !== 'cancelado'
      );
      if (conflito) throw new Error('Horário já ocupado para este barbeiro.');

      const agendamento = {
        id: _genId(),
        clienteId,
        barbeiroId,
        servicoId,
        data,
        hora,
        observacoes,
        status: 'agendado', // agendado | confirmado | concluido | cancelado
        criadoEm: _now(),
        atualizadoEm: _now()
      };
      db.agendamentos.push(agendamento);
      _save(db);
      return agendamento;
    },

    alterarStatus(id, status) {
      const statusValidos = ['agendado', 'confirmado', 'concluido', 'cancelado'];
      if (!statusValidos.includes(status)) throw new Error('Status inválido.');
      const db = _load();
      const idx = db.agendamentos.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Agendamento não encontrado.');
      db.agendamentos[idx].status = status;
      db.agendamentos[idx].atualizadoEm = _now();
      _save(db);
      return db.agendamentos[idx];
    },

    cancelar(id) {
      return this.alterarStatus(id, 'cancelado');
    },

    excluir(id) {
      const db = _load();
      db.agendamentos = db.agendamentos.filter(a => a.id !== id);
      _save(db);
      return true;
    },

    horariosDisponiveis(barbeiroId, data) {
      const db      = _load();
      const config  = db.config;
      const inicio  = parseInt(config.horarioAbre.replace(':', ''));
      const fim     = parseInt(config.horarioFecha.replace(':', ''));
      const intervalo = config.intervaloAgendamento || 30;

      const ocupados = db.agendamentos
        .filter(a => a.barbeiroId === barbeiroId && a.data === data && a.status !== 'cancelado')
        .map(a => a.hora);

      const slots = [];
      let h = Math.floor(inicio / 100);
      let m = inicio % 100;
      while (h * 100 + m < fim) {
        const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        if (!ocupados.includes(hora)) slots.push(hora);
        m += intervalo;
        if (m >= 60) { h++; m -= 60; }
      }
      return slots;
    }
  };

  /* ── AVALIAÇÕES ── */
  const Avaliacoes = {
    listar() {
      return _load().avaliacoes;
    },

    listarPorAgendamento(agendamentoId) {
      return _load().avaliacoes.filter(a => a.agendamentoId === agendamentoId);
    },

    adicionar({ clienteId, agendamentoId, nota, comentario = '' }) {
      if (!clienteId || !agendamentoId || !nota) throw new Error('Campos obrigatórios: clienteId, agendamentoId, nota.');
      if (nota < 1 || nota > 5) throw new Error('Nota deve ser entre 1 e 5.');
      const db = _load();
      const avaliacao = { id: _genId(), clienteId, agendamentoId, nota: parseInt(nota), comentario, criadoEm: _now() };
      db.avaliacoes.push(avaliacao);
      _save(db);
      return avaliacao;
    },

    mediaGeral() {
      const db = _load();
      if (!db.avaliacoes.length) return 0;
      return (db.avaliacoes.reduce((s, a) => s + a.nota, 0) / db.avaliacoes.length).toFixed(1);
    }
  };

  /* ── CONFIG ── */
  const Config = {
    obter() {
      return _load().config;
    },

    salvar(dados) {
      const db = _load();
      db.config = { ...db.config, ...dados, atualizadoEm: _now() };
      _save(db);
      return db.config;
    }
  };

  /* ── RELATÓRIOS / DASHBOARD ── */
  const Relatorios = {
    dashboard() {
      const db = _load();
      const hoje = new Date().toISOString().slice(0, 10);
      return {
        totalClientes:       db.clientes.length,
        totalAgendamentos:   db.agendamentos.length,
        agendamentosHoje:    db.agendamentos.filter(a => a.data === hoje).length,
        agendamentosPendentes: db.agendamentos.filter(a => ['agendado','confirmado'].includes(a.status)).length,
        receitaEstimada:     db.agendamentos
          .filter(a => a.status === 'concluido')
          .reduce((s, a) => {
            const svc = db.servicos.find(sv => sv.id === a.servicoId);
            return s + (svc ? svc.preco : 0);
          }, 0),
        mediaAvaliacao:      Avaliacoes.mediaGeral(),
        totalServicos:       db.servicos.filter(s => s.ativo).length,
        totalBarbeiros:      db.barbeiros.filter(b => b.ativo).length
      };
    },

    agendamentosPorMes() {
      const db = _load();
      const meses = {};
      db.agendamentos.forEach(a => {
        const mes = a.data.slice(0, 7); // YYYY-MM
        meses[mes] = (meses[mes] || 0) + 1;
      });
      return meses;
    },

    exportarJSON() {
      const db = _load();
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `barberDB_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importarJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        localStorage.setItem('barberDB', JSON.stringify(data));
        return true;
      } catch { throw new Error('JSON inválido.'); }
    }
  };

  /* ── INIT ── */
  _seed();

  return { Clientes, Barbeiros, Servicos, Agendamentos, Avaliacoes, Config, Relatorios };

})();

/* expõe globalmente */
window.BarberDB = BarberDB;
