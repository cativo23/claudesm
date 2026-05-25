export abstract class CsmError extends Error {
  abstract readonly exitCode: number;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SessionNotFoundError extends CsmError {
  readonly exitCode = 1;
}

export class ConfigParseError extends CsmError {
  readonly exitCode = 2;
}

export class ClaudeNotFoundError extends CsmError {
  readonly exitCode = 3;
}

export class ClaudeDataDirMissingError extends CsmError {
  readonly exitCode = 4;
}

export class NoSessionsFoundError extends CsmError {
  readonly exitCode = 5;
}

export class CorruptedSessionError extends CsmError {
  readonly exitCode = 6;
}

export class DiskFullError extends CsmError {
  readonly exitCode = 7;
}

export class AmbiguousSessionIdError extends CsmError {
  readonly exitCode = 8;
}
