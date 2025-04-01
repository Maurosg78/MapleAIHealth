/**
 * Datos mock para pruebas de adaptadores EMR
 * Simula respuestas de APIs de sistemas EMR para pruebas unitarias
 */

// Datos de paciente mock para OSCAR EMR
export const oscarPatientData = {
  demographic_no: '12345',
  first_name: 'Roberto',
  last_name: 'García',
  dob: '1975-08-15',
  sex: 'M',
  hin: 'ONT123456789',
  email: 'roberto.garcia@example.com',
  phone: '416-555-1234',
  address: {
    address: '123 Maple Street',
    city: 'Toronto',
    province: 'ON',
    postal: 'M5V 2N4',
    country: 'Canada'
  },
  provider_no: '54321'
};

// Resultados de búsqueda para OSCAR EMR
export const oscarSearchResults = [
  {
    demographic_no: '12345',
    first_name: 'Roberto',
    last_name: 'García',
    dob: '1975-08-15',
    sex: 'M',
    hin: 'ONT123456789'
  },
  {
    demographic_no: '12346',
    first_name: 'Ana',
    last_name: 'Martínez',
    dob: '1982-04-23',
    sex: 'F',
    hin: 'ONT987654321'
  }
];

// Historia del paciente para OSCAR EMR
export const oscarPatientHistory = {
  encounters: [
    {
      id: 'enc_100',
      date: '2023-05-10T14:30:00',
      type: 'Consulta',
      provider: 'Dr. Smith',
      reason: 'Dolor lumbar',
      notes: 'Paciente presenta dolor lumbar desde hace 2 semanas.',
      diagnoses: [
        {
          code: 'M54.5',
          description: 'Dolor lumbar bajo'
        }
      ]
    },
    {
      id: 'enc_101',
      date: '2023-06-20T10:15:00',
      type: 'Seguimiento',
      provider: 'Dr. Smith',
      reason: 'Seguimiento dolor lumbar',
      notes: 'Ha mejorado con fisioterapia, continuar tratamiento.',
      diagnoses: [
        {
          code: 'M54.5',
          description: 'Dolor lumbar bajo'
        }
      ]
    }
  ],
  medications: [
    {
      id: 'med_200',
      name: 'Ibuprofeno',
      dose: '400mg',
      frequency: 'c/8h',
      startDate: '2023-05-10',
      endDate: '2023-05-24'
    },
    {
      id: 'med_201',
      name: 'Ciclobenzaprina',
      dose: '10mg',
      frequency: 'c/noche',
      startDate: '2023-05-10',
      endDate: '2023-05-17'
    }
  ],
  allergies: [
    {
      id: 'alg_300',
      name: 'Penicilina',
      severity: 'Alta',
      reaction: 'Urticaria'
    }
  ],
  diagnostics: [
    {
      id: 'diag_400',
      name: 'Rayos X Columna lumbar',
      date: '2023-05-12',
      result: 'Sin hallazgos significativos',
      provider: 'Centro Radiológico Toronto'
    }
  ]
};

// Datos de paciente mock para ClinicCloud
export const clinicCloudPatientData = {
  id: 'cc-67890',
  nombreCompleto: 'Laura Sánchez Pérez',
  fechaNacimiento: '1988-11-24',
  genero: 'Mujer',
  documento: {
    tipo: 'DNI',
    numero: '87654321X'
  },
  email: 'laura.sanchez@example.es',
  telefono: '634567890',
  direccion: {
    calle: 'Calle Gran Vía 123',
    codigoPostal: '28013',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    pais: 'España'
  },
  numeroHistoria: 'CC-2023-1234'
};

// Resultados de búsqueda para ClinicCloud
export const clinicCloudSearchResults = [
  {
    id: 'cc-67890',
    nombreCompleto: 'Laura Sánchez Pérez',
    fechaNacimiento: '1988-11-24',
    genero: 'Mujer',
    documento: {
      tipo: 'DNI',
      numero: '87654321X'
    },
    numeroHistoria: 'CC-2023-1234'
  },
  {
    id: 'cc-67891',
    nombreCompleto: 'Carlos Martín López',
    fechaNacimiento: '1990-05-17',
    genero: 'Hombre',
    documento: {
      tipo: 'NIE',
      numero: 'X1234567Z'
    },
    numeroHistoria: 'CC-2023-1235'
  }
];

// Historia del paciente para ClinicCloud
export const clinicCloudPatientHistory = {
  consultas: [
    {
      id: 'cons-500',
      fecha: '2023-09-15T16:00:00',
      tipo: 'Primera visita',
      profesional: 'Dra. Rodríguez',
      motivo: 'Dolor cervical',
      notas: 'Paciente con cervicalgia desde hace 1 mes tras accidente de tráfico leve.',
      diagnosticos: [
        {
          codigo: 'M54.2',
          descripcion: 'Cervicalgia'
        }
      ]
    },
    {
      id: 'cons-501',
      fecha: '2023-10-05T17:30:00',
      tipo: 'Revisión',
      profesional: 'Dra. Rodríguez',
      motivo: 'Seguimiento cervicalgia',
      notas: 'Mejoría notable con el tratamiento prescrito.',
      diagnosticos: [
        {
          codigo: 'M54.2',
          descripcion: 'Cervicalgia'
        }
      ]
    }
  ],
  medicamentos: [
    {
      id: 'med-600',
      nombre: 'Enantyum',
      dosis: '25mg',
      frecuencia: 'c/8h',
      fechaInicio: '2023-09-15',
      fechaFin: '2023-09-29'
    },
    {
      id: 'med-601',
      nombre: 'Myolastan',
      dosis: '50mg',
      frecuencia: 'c/noche',
      fechaInicio: '2023-09-15',
      fechaFin: '2023-09-22'
    }
  ],
  alergias: [
    {
      id: 'alg-700',
      nombre: 'Ácido acetilsalicílico',
      severidad: 'Media',
      reaccion: 'Rash cutáneo'
    }
  ],
  pruebas: [
    {
      id: 'pru-800',
      nombre: 'Resonancia Magnética Cervical',
      fecha: '2023-09-20',
      resultado: 'Leve protrusión discal C5-C6',
      centro: 'Centro Médico Madrileño'
    }
  ]
};

// Datos de paciente mock para EPIC (formato FHIR)
export const epicPatientData = {
  resourceType: 'Patient',
  id: 'ep-54321',
  identifier: [
    {
      system: 'urn:oid:1.2.36.146.595.217.0.1',
      value: 'MRN-12345'
    }
  ],
  name: [
    {
      use: 'official',
      family: 'Johnson',
      given: ['Michael', 'James']
    }
  ],
  gender: 'male',
  birthDate: '1980-01-15',
  address: [
    {
      use: 'home',
      line: ['42 Sunset Drive'],
      city: 'Vancouver',
      state: 'BC',
      postalCode: 'V6G 1Z4',
      country: 'Canada'
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '604-555-9876',
      use: 'home'
    },
    {
      system: 'email',
      value: 'michael.johnson@example.com'
    }
  ]
};

// Resultados de búsqueda para EPIC (formato FHIR)
export const epicSearchResults = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 2,
  entry: [
    {
      resource: {
        resourceType: 'Patient',
        id: 'ep-54321',
        identifier: [
          {
            system: 'urn:oid:1.2.36.146.595.217.0.1',
            value: 'MRN-12345'
          }
        ],
        name: [
          {
            use: 'official',
            family: 'Johnson',
            given: ['Michael', 'James']
          }
        ],
        gender: 'male',
        birthDate: '1980-01-15'
      }
    },
    {
      resource: {
        resourceType: 'Patient',
        id: 'ep-54322',
        identifier: [
          {
            system: 'urn:oid:1.2.36.146.595.217.0.1',
            value: 'MRN-12346'
          }
        ],
        name: [
          {
            use: 'official',
            family: 'Williams',
            given: ['Elizabeth', 'Ann']
          }
        ],
        gender: 'female',
        birthDate: '1985-03-22'
      }
    }
  ]
};

// Historia del paciente para EPIC (formato FHIR)
export const epicPatientHistory = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      resource: {
        resourceType: 'Encounter',
        id: 'enc-900',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory'
        },
        subject: {
          reference: 'Patient/ep-54321'
        },
        period: {
          start: '2023-08-10T09:30:00-07:00',
          end: '2023-08-10T10:15:00-07:00'
        },
        reasonCode: [
          {
            text: 'Dolor de hombro derecho'
          }
        ],
        diagnosis: [
          {
            condition: {
              reference: 'Condition/cond-123'
            },
            rank: 1
          }
        ]
      }
    },
    {
      resource: {
        resourceType: 'Condition',
        id: 'cond-123',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '45326000',
              display: 'Tendinitis del manguito rotador'
            }
          ]
        },
        subject: {
          reference: 'Patient/ep-54321'
        },
        onsetDateTime: '2023-08-01'
      }
    },
    {
      resource: {
        resourceType: 'MedicationRequest',
        id: 'med-123',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '849574',
              display: 'Naproxeno 500 MG'
            }
          ]
        },
        subject: {
          reference: 'Patient/ep-54321'
        },
        authoredOn: '2023-08-10',
        dosageInstruction: [
          {
            text: '1 comprimido cada 12 horas durante 7 días',
            timing: {
              repeat: {
                frequency: 2,
                period: 1,
                periodUnit: 'd'
              }
            }
          }
        ]
      }
    }
  ]
};

// Métricas del paciente (para todos los sistemas)
export const patientMetrics = {
  weight: {
    value: 75.5,
    unit: 'kg',
    date: '2023-08-10'
  },
  height: {
    value: 175,
    unit: 'cm',
    date: '2023-08-10'
  },
  bloodPressure: {
    systolic: 120,
    diastolic: 80,
    unit: 'mmHg',
    date: '2023-08-10'
  },
  glucose: {
    value: 95,
    unit: 'mg/dL',
    date: '2023-07-15'
  },
  cholesterol: {
    total: 180,
    hdl: 55,
    ldl: 110,
    unit: 'mg/dL',
    date: '2023-06-20'
  }
};

// Simulación de errores API
export const apiErrors = {
  unauthorized: {
    status: 401,
    message: 'No autorizado. Credenciales inválidas.'
  },
  notFound: {
    status: 404,
    message: 'Recurso no encontrado.'
  },
  serverError: {
    status: 500,
    message: 'Error interno del servidor.'
  },
  badRequest: {
    status: 400,
    message: 'Solicitud incorrecta.'
  }
};
