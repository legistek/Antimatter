namespace AntimatterJS.Sample.AppModel
{
	public struct DocumentPosition
	{
		public float x { get; set; }

		public float y { get; set; }

		public int page { get; set; }

		public float scale { get; set; }

		public static DocumentPosition Default { get; } = new DocumentPosition
		{
			x = 0,
			y = 0,
			page = 0,
			scale = 1
		};
	}
}