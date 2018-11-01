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

  /**
   * Returns true only and only if the message as the input of the function is valid wrt to the schema of the object
   * @param message
   * @return {*}
   */
  isValidMessage({message}){
    return Joi.validate(message,
      this.schema,
      (error, val) => {return !(error) }
    );
  }
}

try{ module.exports = {
  Message
};} catch (e) {}
