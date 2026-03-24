export class PluginSystem{

  constructor(){

    this.plugins=[];

  }

  register(plugin){

    this.plugins.push(plugin);

  }

  run(ctx){

    this.plugins.forEach(p=>p(ctx));

  }

}