	public class Car
	{
		public int Id { get; set; }
		public string Company { get; set; }
		public string Model { get; set; }

		public long Cost { get; set; }
		public string ImagePath { get; set; }
		public Car(string company, string model, long cost, string imagePath)
		{
			Company = company;
			Model = model;
			Cost = cost;
			ImagePath = imagePath;
		}
	}

