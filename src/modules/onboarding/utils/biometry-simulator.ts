/**
 * BiometrySimulator - Simulates biometric verification for demo purposes
 * In production, this would integrate with real biometric services
 */
export class BiometrySimulator {
  /**
   * Simulate face matching between DNI photo and selfie
   * Returns a match score (0-100) and pass/fail status
   */
  static simulateFaceMatch(): {
    score: number;
    passed: boolean;
    message: string;
  } {
    // Generate a realistic score (usually 85-98 for matches)
    const score = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
    const passed = score >= 80;

    return {
      score,
      passed,
      message: passed
        ? `Coincidencia facial verificada (${score}%)`
        : `Coincidencia facial baja (${score}%)`,
    };
  }

  /**
   * Simulate liveness check (detects if photo is from a real person)
   * Checks for movement, blinking, etc.
   */
  static simulateLivenessCheck(): {
    passed: boolean;
    confidence: number;
    details: string[];
  } {
    // Simulate detection of liveness indicators
    const indicators = [
      { name: 'Movimiento detectado', detected: Math.random() > 0.1 },
      { name: 'Parpadeo detectado', detected: Math.random() > 0.15 },
      { name: 'Profundidad 3D validada', detected: Math.random() > 0.1 },
      { name: 'Textura de piel real', detected: Math.random() > 0.05 },
    ];

    const detectedCount = indicators.filter((i) => i.detected).length;
    const confidence = Math.floor((detectedCount / indicators.length) * 100);
    const passed = confidence >= 75;

    const details = indicators.map((i) =>
      i.detected ? `✓ ${i.name}` : `✗ ${i.name}`,
    );

    return {
      passed,
      confidence,
      details,
    };
  }

  /**
   * Simulate full biometric verification
   * Combines face match and liveness check
   */
  static simulateFullVerification(): {
    success: boolean;
    faceMatchScore: number;
    livenessCheck: {
      passed: boolean;
      confidence: number;
    };
    overallScore: number;
    recommendation: 'APPROVED' | 'REVIEW' | 'REJECTED';
    message: string;
  } {
    const faceMatch = this.simulateFaceMatch();
    const liveness = this.simulateLivenessCheck();

    // Calculate overall score (60% face match, 40% liveness)
    const overallScore = Math.floor(
      faceMatch.score * 0.6 + liveness.confidence * 0.4,
    );

    let recommendation: 'APPROVED' | 'REVIEW' | 'REJECTED';
    let message: string;

    if (overallScore >= 85 && faceMatch.passed && liveness.passed) {
      recommendation = 'APPROVED';
      message = 'Verificación biométrica exitosa';
    } else if (overallScore >= 70) {
      recommendation = 'REVIEW';
      message = 'Verificación requiere revisión manual';
    } else {
      recommendation = 'REJECTED';
      message = 'Verificación biométrica fallida';
    }

    return {
      success: recommendation === 'APPROVED',
      faceMatchScore: faceMatch.score,
      livenessCheck: {
        passed: liveness.passed,
        confidence: liveness.confidence,
      },
      overallScore,
      recommendation,
      message,
    };
  }

  /**
   * Simulate document verification (OCR + validation)
   */
  static simulateDocumentVerification(documentType: 'DNI' | 'PROOF'): {
    verified: boolean;
    extractedData?: any;
    issues: string[];
  } {
    const issues: string[] = [];

    // Random chance of issues (10% probability)
    if (Math.random() < 0.1) {
      issues.push('Calidad de imagen baja');
    }
    if (Math.random() < 0.05) {
      issues.push('Documento parcialmente visible');
    }

    const verified = issues.length === 0;

    let extractedData = null;
    if (verified && documentType === 'DNI') {
      // Simulate OCR extraction
      extractedData = {
        documentNumber: `CC${Math.floor(Math.random() * 90000000) + 10000000}`,
        names: 'JUAN CARLOS',
        lastnames: 'PÉREZ GARCÍA',
        birthDate: '1990-05-15',
        expeditionDate: '2015-03-20',
        expiryDate: '2025-03-20',
      };
    }

    return {
      verified,
      extractedData,
      issues,
    };
  }

  /**
   * Calculate time estimate for next verification step
   */
  static getVerificationTime(): string {
    const times = [
      '30 segundos',
      '1 minuto',
      '2 minutos',
      'Instantáneo',
    ];
    return times[Math.floor(Math.random() * times.length)];
  }
}
