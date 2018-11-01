class Message{
  constructor({name, description="", schema, onReception}){

    this.name = name;
    this.schema = schema;
    this.onReception = onReception;
    this.description = description;

  }

  /**
   *
   * @param content
   * @param to
   */
  emit({content, to=[]}){
    console.log("Emitting the message");
  }
}

try{ module.exports = {
  Message
};} catch (e) {}
