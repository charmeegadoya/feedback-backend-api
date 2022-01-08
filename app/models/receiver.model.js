module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      username: String,
      receiverId: String,
      profileImage:String
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Rec = mongoose.model("receiver", schema);
  return Rec;
};