module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      receiverId: String,
      feedback: String,
      logedin:String
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Tutorial = mongoose.model("feedback", schema);
  return Tutorial;
};