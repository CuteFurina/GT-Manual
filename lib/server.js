import './config/init.js';
import ListenerLoader from './loader/listener.js';
import cfg from './config/config.js';
import express from 'express';

export default class Server {
  constructor(app) {
    this.app = app;
    this.cfg = cfg;
  }

  static create() {
    const server = new Server(express());
    ListenerLoader.create(server);
    return server.app;
  }
}