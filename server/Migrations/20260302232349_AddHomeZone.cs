using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiffDetector.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Zone",
                table: "MakeConnections",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Zone",
                table: "MakeConnections");
        }
    }
}
